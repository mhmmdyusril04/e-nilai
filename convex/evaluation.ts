import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser } from "./users";

export const submitAssessment = mutation({
  args: {
    nominasiId: v.id("nominasi"),
    skor: v.array(
      v.object({
        indikator: v.string(),
        nilai: v.number(),
      })
    ),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const me = await getUser(ctx, identity.tokenIdentifier);
    if (me.role !== "atasan" || !me.bidangId) {
      throw new ConvexError(
        "Hanya atasan dengan bidang yang terdefinisi yang dapat menilai."
      );
    }

    const nominasi = await ctx.db.get(args.nominasiId);
    if (!nominasi) {
      throw new ConvexError("Nominasi tidak ditemukan.");
    }

    if (nominasi.bidangId !== me.bidangId) {
      throw new ConvexError(
        "Anda tidak berhak menilai nominasi dari bidang lain."
      );
    }

    if (nominasi.status === "selesai") {
      throw new ConvexError("Nominasi ini sudah selesai dinilai.");
    }

    const existingPenilaian = await ctx.db
      .query("penilaian")
      .withIndex("by_nominasiId", (q) => q.eq("nominasiId", args.nominasiId))
      .filter((q) => q.eq(q.field("penilaiId"), me._id))
      .first();

    if (existingPenilaian) {
      throw new ConvexError(
        "Anda sudah pernah memberikan penilaian untuk nominasi ini."
      );
    }

    const totalNilai = args.skor.reduce((acc, curr) => acc + curr.nilai, 0);
    const rataRataNilai = totalNilai / args.skor.length;

    await ctx.db.insert("penilaian", {
      nominasiId: args.nominasiId,
      skor: args.skor,
      totalNilai,
      rataRataNilai,
      penilaiId: me._id,
      bidangId: nominasi.bidangId, // ✅ tambahkan ini
      tanggal: Date.now(),
      selesai: true,
    });
  },
});

export const getAllEvaluationResults = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const me = await getUser(ctx, identity.tokenIdentifier);
    if (me.role !== "admin" && me.role !== "atasan") {
      return [];
    }

    let penilaianQuery = ctx.db.query("penilaian");

    if (me.role === "atasan" && me.bidangId) {
      penilaianQuery = penilaianQuery.filter((q) =>
        q.eq(q.field("bidangId"), me.bidangId)
      );
    }

    const allPenilaian = await penilaianQuery.collect();

    const results = await Promise.all(
      allPenilaian.map(async (penilaian) => {
        const nominasi = await ctx.db.get(penilaian.nominasiId);
        const pegawai = nominasi ? await ctx.db.get(nominasi.pegawaiId) : null;
        const bidang = pegawai ? await ctx.db.get(pegawai.bidangId) : null;
        const penilai = await ctx.db.get(penilaian.penilaiId);

        return {
          namaPegawai: pegawai?.name,
          nipPegawai: pegawai?.nip,
          namaBidang: bidang?.name,
          namaPenilai: penilai?.name,
          periode: nominasi?.periode,
          skor: penilaian.skor,
          totalNilai: penilaian.totalNilai,
          rataRataNilai: penilaian.rataRataNilai,
        };
      })
    );
    return results;
  },
});

export const getMyEvaluations = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const me = await getUser(ctx, identity.tokenIdentifier);

    const isAdmin = me.role === "admin";

    // Ambil semua penilaian (untuk admin), atau hanya milik sendiri (untuk atasan)
    const penilaianList = isAdmin
      ? await ctx.db.query("penilaian").order("desc").collect()
      : await ctx.db
          .query("penilaian")
          .filter((q) => q.eq(q.field("penilaiId"), me._id))
          .order("desc")
          .collect();

    return await Promise.all(
      penilaianList.map(async (p) => {
        const nominasi = await ctx.db.get(p.nominasiId);
        const pegawai = nominasi ? await ctx.db.get(nominasi.pegawaiId) : null;
        const bidang = nominasi ? await ctx.db.get(nominasi.bidangId) : null;

        return {
          ...p,
          namaPegawai: pegawai?.name ?? "Tidak ditemukan",
          namaBidang: bidang?.name ?? "-",
          periode: nominasi?.periode ?? "-",
        };
      })
    );
  },
});
