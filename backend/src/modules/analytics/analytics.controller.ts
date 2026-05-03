// controller only acessses http from user
// relies on service
import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';
import { Parser } from 'json2csv';
//import PDFDocument from 'pdfkit'; I haven't quite figured out how to do the pdf export

export const exportRevenueCSV = async(req: Request, res: Response) => {
    try {
        const {vendor_id} = req.params as {vendor_id: string};
        const interval = (req.query.interval as string || 'day') as 'hour' | 'day' | 'week' | 'month' | 'year';

        const data = await analyticsService.getRevenueStats(vendor_id, interval);
        const parser = new Parser({ fields: ['period', 'revenue'] });
        const csv = parser.parse(data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.csv"');
        res.send(csv);      
    } catch (error){
        res.status(500).json({message:'Export failed'});
    }
};

