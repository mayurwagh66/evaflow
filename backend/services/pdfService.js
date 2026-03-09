const PDFDocument = require('pdfkit');

class PDFService {
  static generateEnhancedReport(reportData) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Helper function to clean lane formatting
      const cleanLaneFormat = (lane) => {
        if (!lane) return lane;
        return lane.replace(/!'\s*/g, ' → ').replace(/!\s*/g, ' → ').replace(/\s+→\s+/g, ' → ').trim();
      };

      // Add page border
      this.addPageBorder(doc);

      // Header with company branding
      this.addHeader(doc);

      // Report title and metadata
      this.addReportTitle(doc, reportData);

      // Executive Summary
      this.addExecutiveSummary(doc, reportData);

      // Key Metrics Dashboard
      this.addKeyMetrics(doc, reportData);

      // Lane Performance Table
      this.addLanePerformanceTable(doc, reportData, cleanLaneFormat);

      // Carrier Performance Table
      this.addCarrierPerformanceTable(doc, reportData);

      // High Emission Routes
      this.addHighEmissionRoutes(doc, reportData, cleanLaneFormat);

      // Sustainability Insights
      this.addSustainabilityInsights(doc, reportData);

      // Footer
      this.addFooter(doc);

      doc.end();
    });
  }

  static addPageBorder(doc) {
    const { width, height } = doc.page;
    doc.lineWidth(2);
    doc.strokeColor('#10b981');
    doc.rect(20, 20, width - 40, height - 40).stroke();
  }

  static addHeader(doc) {
    const { width } = doc.page;
    
    // Green header bar
    doc.fillColor('#10b981');
    doc.rect(50, 50, width - 100, 60).fill();
    
    // Company logo and name
    doc.fillColor('white');
    doc.fontSize(24).font('Helvetica-Bold');
    doc.text('EvaFlow', 70, 70);
    
    doc.fontSize(16).font('Helvetica');
    doc.text('Carbon Intelligence Platform', 170, 75);
    
    // Report type badge
    doc.fillColor('#065f46');
    doc.roundedRect(width - 200, 70, 130, 30, 5).fill();
    doc.fillColor('white');
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('EMISSIONS REPORT', width - 190, 78);
  }

  static addReportTitle(doc, reportData) {
    doc.fillColor('#1e293b');
    doc.fontSize(20).font('Helvetica-Bold');
    doc.text('Carbon Emissions Analysis Report', 50, 140);
    
    doc.fontSize(12).font('Helvetica');
    doc.fillColor('#64748b');
    const generatedDate = new Date(reportData.generatedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`Generated on: ${generatedDate}`, 50, 165);
    
    if (reportData.period.startDate !== 'All') {
      doc.text(`Period: ${reportData.period.startDate} to ${reportData.period.endDate}`, 50, 180);
    }
  }

  static addExecutiveSummary(doc, reportData) {
    doc.fillColor('#f8fafc');
    doc.roundedRect(50, 200, doc.page.width - 100, 140, 8).fill();
    
    doc.fillColor('#1e293b');
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('Executive Summary', 70, 220);
    
    doc.fontSize(11).font('Helvetica');
    doc.fillColor('#475569');
    
    const summary = reportData.summary;
    const summaryText = `This report provides a comprehensive analysis of carbon emissions across ${summary.shipmentCount} shipments, totaling ${summary.totalDistance.toLocaleString()} km. Total CO₂ emissions recorded: ${summary.totalEmissions.toFixed(2)} kg, with an average efficiency of ${(summary.totalEmissions / summary.totalDistance * 1000).toFixed(2)} g/km.`;
    
    doc.text(summaryText, 70, 245, { width: doc.page.width - 140, align: 'justify' });
    
    // Key highlights with better spacing
    doc.fontSize(12).font('Helvetica-Bold');
    doc.fillColor('#059669');
    doc.text('Key Highlights:', 70, 285);
    
    doc.fontSize(10).font('Helvetica');
    doc.fillColor('#475569');
    doc.text(`• Total shipments analyzed: ${summary.shipmentCount}`, 70, 305);
    doc.text(`• Total distance covered: ${summary.totalDistance.toLocaleString()} km`, 70, 320);
    doc.text(`• Total CO₂ emissions: ${summary.totalEmissions.toFixed(2)} kg`, 280, 305);
    doc.text(`• Average efficiency: ${(summary.totalEmissions / summary.totalDistance * 1000).toFixed(2)} g/km`, 280, 320);
  }

  static addKeyMetrics(doc, reportData) {
    const { width } = doc.page;
    const metrics = [
      { label: 'Total Emissions', value: `${reportData.summary.totalEmissions.toFixed(0)} kg`, color: '#dc2626' },
      { label: 'Total Shipments', value: reportData.summary.shipmentCount.toString(), color: '#2563eb' },
      { label: 'Avg Efficiency', value: `${(reportData.summary.totalEmissions / reportData.summary.totalDistance * 1000).toFixed(2)} g/km`, color: '#7c3aed' },
      { label: 'Total Distance', value: `${reportData.summary.totalDistance.toLocaleString()} km`, color: '#059669' }
    ];

    const boxWidth = (width - 140) / 2;
    let x = 70;
    let y = 360; // Increased spacing from executive summary

    metrics.forEach((metric, index) => {
      // Metric box
      doc.fillColor(metric.color);
      doc.roundedRect(x, y, boxWidth, 80, 8).fill();
      
      // Value
      doc.fillColor('white');
      doc.fontSize(20).font('Helvetica-Bold');
      doc.text(metric.value, x + 15, y + 15);
      
      // Label
      doc.fontSize(11).font('Helvetica');
      doc.text(metric.label, x + 15, y + 55);
      
      // Position next box
      if (index % 2 === 0) {
        x += boxWidth + 20;
      } else {
        x = 70;
        y += 90;
      }
    });
  }

  static addLanePerformanceTable(doc, reportData, cleanLaneFormat) {
    const { width } = doc.page;
    
    // Table header with more spacing
    doc.fillColor('#1e293b');
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('Lane Performance Analysis', 70, 570); // Increased spacing
    
    // Table
    const tableY = 600; // Increased spacing
    const tableHeaders = ['Lane', 'Shipments', 'Total Emissions (kg)', 'Avg per Shipment (kg)'];
    const columnWidths = [220, 80, 120, 100];
    
    // Header row
    doc.fillColor('#f1f5f9');
    doc.rect(70, tableY, width - 140, 35).fill();
    
    doc.fillColor('#1e293b');
    doc.fontSize(11).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      const x = 80 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(header, x, tableY + 12);
    });
    
    // Data rows
    let rowY = tableY + 35;
    doc.fontSize(10).font('Helvetica');
    
    reportData.laneSummary.slice(0, 10).forEach((lane, index) => {
      // Clean lane format to replace ! with →
      const cleanLane = cleanLaneFormat(lane._id);
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.fillColor('#fafafa');
        doc.rect(70, rowY, width - 140, 28).fill();
      }
      
      doc.fillColor('#475569');
      const avgPerShipment = lane.totalEmissions / lane.shipmentCount;
      
      const rowData = [
        cleanLane,
        lane.shipmentCount.toString(),
        lane.totalEmissions.toFixed(2),
        avgPerShipment.toFixed(2)
      ];
      
      rowData.forEach((data, i) => {
        const x = 80 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(data, x, rowY + 9, { width: columnWidths[i] - 10 });
      });
      
      rowY += 28;
    });
  }

  static addCarrierPerformanceTable(doc, reportData) {
    const { width } = doc.page;
    
    // Add new page if needed
    if (doc.y > 700) {
      doc.addPage();
      this.addPageBorder(doc);
      this.addHeader(doc);
    }
    
    const tableY = doc.y + 30;
    
    // Table header
    doc.fillColor('#1e293b');
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('Carrier Performance Analysis', 70, tableY - 20);
    
    const tableHeaders = ['Carrier', 'Shipments', 'Total Emissions (kg)', 'Avg per Shipment (kg)'];
    const columnWidths = [200, 80, 120, 100];
    
    // Header row
    doc.fillColor('#f1f5f9');
    doc.rect(70, tableY, width - 140, 35).fill();
    
    doc.fillColor('#1e293b');
    doc.fontSize(11).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      const x = 80 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(header, x, tableY + 12);
    });
    
    // Data rows
    let rowY = tableY + 35;
    doc.fontSize(10).font('Helvetica');
    
    reportData.carrierPerformance.slice(0, 8).forEach((carrier, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        doc.fillColor('#fafafa');
        doc.rect(70, rowY, width - 140, 28).fill();
      }
      
      doc.fillColor('#475569');
      const avgPerShipment = carrier.totalEmissions / carrier.shipmentCount;
      
      const rowData = [
        carrier._id,
        carrier.shipmentCount.toString(),
        carrier.totalEmissions.toFixed(2),
        avgPerShipment.toFixed(2)
      ];
      
      rowData.forEach((data, i) => {
        const x = 80 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(data, x, rowY + 9, { width: columnWidths[i] - 10 });
      });
      
      rowY += 28;
    });
  }

  static addHighEmissionRoutes(doc, reportData, cleanLaneFormat) {
    const { width } = doc.page;
    
    // Add new page if needed
    if (doc.y > 620) {
      doc.addPage();
      this.addPageBorder(doc);
      this.addHeader(doc);
    }
    
    const sectionY = doc.y + 40; // Increased spacing
    
    // Section header
    doc.fillColor('#dc2626');
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('High Emission Routes Alert', 70, sectionY);
    
    doc.fontSize(11).font('Helvetica');
    doc.fillColor('#7f1d1d');
    doc.text('Routes requiring immediate attention for optimization', 70, sectionY + 30); // More spacing
    
    // Alert boxes
    let alertY = sectionY + 60; // Increased spacing
    
    reportData.topHighEmissionRoutes.slice(0, 5).forEach((route, index) => {
      // Clean lane format to replace ! with →
      const cleanLane = cleanLaneFormat(route._id);
      
      // Alert box
      doc.fillColor('#fef2f2');
      doc.roundedRect(70, alertY, width - 140, 70, 5).fill();
      
      // Border
      doc.lineWidth(1);
      doc.strokeColor('#dc2626');
      doc.roundedRect(70, alertY, width - 140, 70, 5).stroke();
      
      // Content
      doc.fillColor('#dc2626');
      doc.fontSize(13).font('Helvetica-Bold');
      doc.text(`${index + 1}. ${cleanLane}`, 80, alertY + 15); // Use cleaned lane
      
      doc.fontSize(11).font('Helvetica');
      doc.fillColor('#7f1d1d');
      doc.text(`Total Emissions: ${route.totalEmissions.toFixed(2)} kg`, 80, alertY + 35);
      doc.text(`Shipments: ${route.shipmentCount}`, 80, alertY + 50);
      
      // Recommendation badge
      doc.fillColor('#dc2626');
      doc.roundedRect(width - 180, alertY + 20, 100, 25, 3).fill();
      doc.fillColor('white');
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('REQUIRES ACTION', width - 175, alertY + 27);
      
      alertY += 80;
    });
  }

  static addSustainabilityInsights(doc, reportData) {
    const { width } = doc.page;
    
    // Add new page if needed
    if (doc.y > 600) {
      doc.addPage();
      this.addPageBorder(doc);
      this.addHeader(doc);
    }
    
    const sectionY = doc.y + 20;
    
    // Section header
    doc.fillColor('#059669');
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Sustainability Insights & Recommendations', 70, sectionY);
    
    // Insights box
    doc.fillColor('#ecfdf5');
    doc.roundedRect(70, sectionY + 20, width - 140, 150, 8).fill();
    
    doc.lineWidth(1);
    doc.strokeColor('#10b981');
    doc.roundedRect(70, sectionY + 20, width - 140, 150, 8).stroke();
    
    // Content
    doc.fillColor('#065f46');
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Key Recommendations:', 80, sectionY + 35);
    
    doc.fontSize(10).font('Helvetica');
    doc.fillColor('#047857');
    
    const recommendations = [
      `• Optimize ${reportData.topHighEmissionRoutes[0]?._id || 'high-emission routes'} for immediate impact`,
      `• Consider fuel switching for routes with emissions above ${(reportData.summary.totalEmissions / reportData.summary.shipmentCount * 1.5).toFixed(0)} kg per shipment`,
      `• Implement load consolidation to improve efficiency by 15-25%`,
      `• Explore alternative transportation modes for long-distance routes`,
      `• Set emission reduction targets based on current baseline of ${reportData.summary.totalEmissions.toFixed(0)} kg`
    ];
    
    recommendations.forEach((rec, index) => {
      doc.text(rec, 80, sectionY + 55 + (index * 15));
    });
    
    // Sustainability score
    const score = Math.max(0, Math.min(100, 100 - (reportData.summary.totalEmissions / 50)));
    doc.fillColor('#10b981');
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`Sustainability Score: ${score.toFixed(0)}/100`, 80, sectionY + 140);
    
    // Progress bar
    doc.fillColor('#e5e7eb');
    doc.roundedRect(80, sectionY + 155, 200, 10, 5).fill();
    doc.fillColor('#10b981');
    doc.roundedRect(80, sectionY + 155, (score / 100) * 200, 10, 5).fill();
  }

  static addFooter(doc) {
    const { width } = doc.page;
    const footerY = doc.page.height - 80;
    
    // Footer line
    doc.lineWidth(1);
    doc.strokeColor('#e5e7eb');
    doc.moveTo(50, footerY).lineTo(width - 50, footerY).stroke();
    
    // Footer content
    doc.fillColor('#64748b');
    doc.fontSize(9).font('Helvetica');
    doc.text('© 2024 EvaFlow - Carbon Intelligence Platform', 70, footerY + 10);
    doc.text('Confidential Report - For Internal Use Only', 70, footerY + 25);
    
    // Page number
    doc.text(`Page ${doc.page.document.pageCount}`, width - 120, footerY + 10);
  }
}

module.exports = PDFService;
