"use client"
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Page = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const data = [
    { id: 1, name: 'ZZZZZZZZ-Total', valan: '17FEB-21FEB', gross: 0.00, cltBrok: 0.00, bill: 0.00, totalMTM: 0.00, selfBrok: 0.00, brokM: 0.00, downline: 0.00, upline: 0.00, self: 0.00 },
    // Add more data as needed
  ];

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className='bg-white'>
      <div className="p-2  ">
        <div className="flex items-center space-x-2 bg-white shadow-md rounded-lg p-3">
          <span className="text-xl font-bold w-[180px]">Summary Report</span>
          <div className="marquee">
            <span className="text-red-600">
              Money involved. This is a Virtual Trading Application which has
              all the features to trade. This application is used for exchanging
              views on markets for India
            </span>
          </div>
        </div>
      </div>
      <div className="p-2 flex justify-center ">
        <div className="w-full p-4 bg-darkgrayish text-white rounded-md">
          <div className="flex flex-wrap">
            {["Market", "Script Name", "Valan", "Master", "Broker", "Client"].map((label, index) => (
              <div className="flex flex-col mr-1 mb-2 w-full sm:w-auto" key={index}>
                <label className="font-black">{label}</label>
                <select
                  id="countries"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option selected>Index</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                </select>
              </div>
            ))}
            <div className="flex flex-col mb-2 mr-1  sm:w-auto">
              <label className="font-black">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col mr-2 mb-2 w-full sm:w-auto">
              <label className="font-black">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <button className="flex justify-center items-center bg-white text-black w-[120px] h-[40px] font-semibold text-sm border-b-2 border-orange-400 rounded-sm">
                Submit / Refresh  
              </button>
              <button className="flex justify-center items-center bg-white text-black w-[100px] h-[40px] font-semibold text-sm border-b-2 border-orange-400 rounded-sm">
                Script Wise Summary
              </button>
              <button className="flex justify-center items-center bg-white text-black w-[100px] h-[40px] font-semibold text-sm border-b-2 border-orange-400 rounded-sm">
                Reset
              </button>
              <button className="flex justify-center items-center bg-white text-black w-[100px] h-[40px] font-semibold text-sm border-b-2 border-orange-400 rounded-sm">
                Net Position
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-darkgrayish text-white flex justify-between items-center p-2">
          <button className="text-green-500 text-2xl">
            <i className="fas fa-bars"></i>
          </button>
          <div className="flex items-center space-x-2">
            <button className="bg-white text-black px-4 py-1 rounded shadow">CSV</button>
            <button className="bg-white text-black px-4 py-1 rounded shadow">PDF</button>
          </div>
          <div className="flex items-center space-x-2">
            <input
              className="border rounded px-2 py-1"
              placeholder="Search:"
              type="text"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="text-white text-2xl">
              <i className="fas fa-expand"></i>
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center mb-4">
            <label className="mr-2" htmlFor="entries">Show</label>
            <select className="border rounded px-2 py-1" id="entries">
              <option value="200">100</option>
              <option value="200">200</option>
              <option value="200">300</option>
              <option value="200">400</option>
              <option value="200">500</option>
            </select>
            <span className="ml-2">entries</span>
          </div>
          <table className="min-w-full bg-white">
            <thead>
              <tr className="w-full bg-gray-200 text-left text-xs uppercase text-gray-600">
                <th className="py-2 px-3 border-b">NO.</th>
                <th className="py-2 px-3 border-b">NAME</th>
                <th className="py-2 px-3 border-b">ALL</th>
                <th className="py-2 px-3 border-b">Outst.</th>
                <th className="py-2 px-3 border-b">Valan</th>
                <th className="py-2 px-3 border-b">Gross</th>
                <th className="py-2 px-3 border-b">Clt.Brok.</th>
                <th className="py-2 px-3 border-b">Bill</th>
                <th className="py-2 px-3 border-b">Total.MTM</th>
                <th className="py-2 px-3 border-b">Self.Brok.</th>
                <th className="py-2 px-3 border-b">Brok.M</th>
                <th className="py-2 px-3 border-b">Downline</th>
                <th className="py-2 px-3 border-b">Upline</th>
                <th className="py-2 px-3 border-b">Self</th>
                <th className="py-2 px-3 border-b">N.B.</th>
                <th className="py-2 px-3 border-b">N.P</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item.id} className="bg-gray-100 text-xs text-gray-700">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b">
                    <img
                      alt="PDF icon"
                      className="inline-block"
                      height="20"
                      src="https://storage.googleapis.com/a1aa/image/x1uREXanGWD72A0enkVuTcTpSV0ObXppv5czCrAmiQo.jpg"
                      width="20"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <img
                      alt="PDF icon"
                      className="inline-block"
                      height="20"
                      src="https://storage.googleapis.com/a1aa/image/x1uREXanGWD72A0enkVuTcTpSV0ObXppv5czCrAmiQo.jpg"
                      width="20"
                    />
                  </td>
                  <td className="py-1 px-2 border-b">{item.valan}</td>
                  <td className="py-2 px-2 border-b">{item.gross.toFixed(2)}</td>
                  <td className="py-2 px-2 border-b">{item.cltBrok.toFixed(2)}</td>
                  <td className="py-2 px-2 border-b">{item.bill.toFixed(2)}</td>
                  <td className="py-2 px-2 border-b">{item.totalMTM.toFixed(2)}</td>
                  <td className="py-2 px-2 border-b">{item.selfBrok.toFixed(2)}</td>
                  <td className="py-2 px-2 border-b">{item.brokM.toFixed(2)}</td>
                  <td className="py-2 px-2 border-b">{item.downline.toFixed(2)}</td>
                  <td className="py-2 px-2 border-b">{item.upline.toFixed(2)}</td>
                  <td className="py-2 px-2 border-b">{item.self.toFixed(2)}</td>
                  <td className="py-2 px-2 border-b">
                    <img
                      alt="PDF icon"
                      className="inline-block"
                      height="20"
                      src="https://storage.googleapis.com/a1aa/image/x1uREXanGWD72A0enkVuTcTpSV0ObXppv5czCrAmiQo.jpg"
                      width="20"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <img
                      alt="PDF icon"
                      className="inline-block"
                      height="20"
                      src="https://storage.googleapis.com/a1aa/image/x1uREXanGWD72A0enkVuTcTpSV0ObXppv5czCrAmiQo.jpg"
                      width="20"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <span>Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {filteredData.length} entries</span>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => handleClick(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Page;