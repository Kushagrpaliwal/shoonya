import { NextResponse } from "next/server";
import axios from 'axios';
import fs from 'fs';
import AdmZip from 'adm-zip';

const url = 'https://api.shoonya.com/NFO_symbols.txt.zip';
const outputZipPath = 'INDEX_symbols.zip';
const outputTxtPath = 'NFO_symbols.txt';

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
        const indexDataArray = data.split('\n').map(line => {
            const parts = line.split(',');

            if (parts.length < 11) return null; 

            return {
                Exchange: parts[0],
                Token: parts[1],
                LotSize: parts[2],
                script: parts[3],
                TradingSymbol: parts[4],
                Expiry: parts[5],
                Instrument: parts[6],
                OptionType: parts[7],
                StrikePrice: parts[8],
                TickSize: parts[9],
            };
        }).filter(Boolean); 

        const { searchParams } = new URL(req.url);
        const scriptParam = searchParams.get('script');

     // Filter the data based on the script parameter and entryType being FUTCOM
     const filteredData = indexDataArray.filter(item => (scriptParam ? item.script === scriptParam : true) && item.Instrument === "FUTIDX");

        if (filteredData.length > 0) {
            return NextResponse.json(filteredData, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No data found for the specified script and entryType FUTIDX' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching or extracting the file:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}