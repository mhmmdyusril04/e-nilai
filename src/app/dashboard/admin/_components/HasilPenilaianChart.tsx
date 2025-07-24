"use client";

import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function HasilPenilaianChart() {
    const hasilPenilaian = useQuery(api.evaluation.getAllEvaluationResults);

    if (hasilPenilaian === undefined) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const chartData = (hasilPenilaian ?? []).map(item => ({
        name: item.namaPegawai,
        "Total Nilai": item.totalNilai,
    }));

    const chartAverageData = (hasilPenilaian ?? []).map(item => ({
        name: item.namaPegawai,
        "Rata-rata Nilai": item.rataRataNilai,
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Diagram Batang Hasil Penilaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {chartData.length === 0 && chartAverageData.length === 0 && (
                    <p className="text-center text-gray-500">Belum ada data penilaian untuk ditampilkan.</p>
                )}

                {chartData.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-center">Total Nilai per Pegawai</h3>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} />
                                    <YAxis />
                                    <Tooltip />
                                    {/* <Legend /> */}
                                    <Bar dataKey="Total Nilai" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {chartAverageData.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-center">Rata-rata Nilai per Pegawai</h3>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartAverageData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} />
                                    <YAxis />
                                    <Tooltip />
                                    {/* <Legend /> */}
                                    <Bar dataKey="Rata-rata Nilai" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}