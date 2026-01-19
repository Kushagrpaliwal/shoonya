import { NextResponse } from "next/server";
import axios from 'axios';
import fs from 'fs';
import AdmZip from 'adm-zip';

const url = 'https://api.shoonya.com/MCX_symbols.txt.zip';
const outputZipPath = 'MCX_symbols.zip';
const outputTxtPath = 'MCX_symbols.txt';

export async function GET(req) {
    try {
        // Fetch the ZIP file
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        
        // Write the ZIP file to the filesystem
        fs.writeFileSync(outputZipPath, response.data);
        console.log('ZIP file downloaded successfully.');

        // Extract the ZIP file
        const zip = new AdmZip(outputZipPath);
        zip.extractAllTo('./', true);
        console.log('ZIP file extracted successfully.');

        // Read the extracted text file
        const data = fs.readFileSync(outputTxtPath, 'utf8');
        console.log('Contents of the extracted file:');

        // Split the data into lines and map to an array of objects
        const mcxDataArray = data.split('\n').map(line => {
            const parts = line.split(',');

            if (parts.length < 12) return null; 

            return {
                Exchange: parts[0],
                Token: parts[1],
                LotSize: parts[2],
                GNGD: parts[3],
                script: parts[4],
                TradingSymbol: parts[5],
                Expiry: parts[6],
                Instrument: parts[7],
                OptionType: parts[8],
                StrikePrice: parts[9],
                TickSize: parts[10],
            };
        }).filter(Boolean); 

        // Get the script query parameter
        const { searchParams } = new URL(req.url);
        const scriptParam = searchParams.get('script');

        // Filter the data based on the script parameter and entryType being FUTCOM
        const filteredData = mcxDataArray.filter(item => 
            (scriptParam ? item.script === scriptParam : true) && item.Instrument === "FUTCOM"
        );

        // Return the filtered MCX data in JSON format
        if (filteredData.length > 0) {
            return NextResponse.json(filteredData, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No data found for the specified script and entryType FUTCOM.' }, { status: 404 });
        }
        
    } catch (error) {
        console.error('Error fetching or extracting the file:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}