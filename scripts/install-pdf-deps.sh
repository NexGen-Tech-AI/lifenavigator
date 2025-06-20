#!/bin/bash

echo "Installing PDF generation dependencies..."
npm install jspdf jspdf-autotable @types/jspdf --save

echo "PDF dependencies installed successfully!"
echo "You can now uncomment the PDF generation code in:"
echo "  - src/lib/services/reportGeneratorService.ts"