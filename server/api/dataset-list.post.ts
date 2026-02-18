
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const targets = body?.targets || [];

    // Mock data generation based on requested targets
    const mockData = targets.map((target: any) => ({
        id_dataset: target.id_dataset,
        id_indikator: target.id_indikator,
        dataset_label: `Dataset (Mock) ${target.id_dataset}-${target.id_indikator}`,
        title: `Indikator ${target.id_indikator}`,
        description: "Data simulasi untuk kebutuhan development",
        source: "BPS (Simulated)",
        updated_at: new Date().toISOString()
    }));

    return {
        success: true,
        data: mockData,
        message: "Data fetched from mock adapter"
    };
});
