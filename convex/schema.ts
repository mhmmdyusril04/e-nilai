import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const roles = v.union(
  v.literal("admin"),
  v.literal("ketua_bidang"),
  v.literal("atasan")
);

export default defineSchema({
  bidang: defineTable({
    name: v.string(),
  }),

  pegawai: defineTable({
    name: v.string(),
    nip: v.string(),
    bidangId: v.id("bidang"),
  }).index("by_bidangId", ["bidangId"]),

  nominasi: defineTable({
    pegawaiId: v.id("pegawai"),
    bidangId: v.id("bidang"),
    periode: v.string(),
    status: v.union(v.literal("dinominasikan"), v.literal("selesai")),
  }).index("by_bidang_periode", ["bidangId", "periode"]),

  penilaian: defineTable({
    nominasiId: v.id("nominasi"),
    skor: v.array(
      v.object({
        indikator: v.string(),
        nilai: v.number(),
      })
    ),
    totalNilai: v.number(),
    rataRataNilai: v.number(),
    penilaiId: v.id("users"),
    tanggal: v.number(),
    selesai: v.boolean(),
  })
    .index("by_nominasiId", ["nominasiId"])
    .index("by_penilaiId", ["penilaiId"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    role: roles,
    bidangId: v.optional(v.id("bidang")),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  indikator: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }),
});
