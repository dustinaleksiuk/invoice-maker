const ejs = require('ejs');
const fs = require('fs');
const dayjs = require('dayjs')
const yargs = require('yargs/yargs');
const currency = require('currency.js');

const args = yargs(process.argv).argv;

const configJson = fs.readFileSync(`${__dirname}/config.json`);
const configData = JSON.parse(configJson);

const year = args.year;
const month = args.month - 1; // Months are zero-based in dayjs, which is stupid.

// TODO: validation
// Invoice prefix ie. aleksiuk-invoice-2020-10

let date = dayjs().year(year).month(month);
date = date.date(date.daysInMonth());

const invoiceDate = args.date ? dayjs(args.date) : dayjs().now();

const formattedEndDate = date.format('MMM D, YYYY');
const fileNameDate = date.format('YYYY-MM');
const formattedInvoiceDate = invoiceDate.format('MMM D, YYYY');

const hoursWorkedDollarAmount = currency(configData.hourlyRate).multiply(args.hours);
const gstSubtotalDollarAmount = currency(hoursWorkedDollarAmount).multiply(0.05);
const totalDollarAmount = currency(hoursWorkedDollarAmount).add(gstSubtotalDollarAmount);

const data = {
  hoursWorked: args.hours,
  invoiceNumber: args.number,
  invoiceDate: formattedInvoiceDate,
  payPeriodEnding: formattedEndDate,
  myCompanyName: configData.myCompanyName,
  myAddressOne: configData.myAddressOne,
  myAddressTwo: configData.myAddressTwo,
  billToCompanyName: configData.billToCompanyName,
  billToAddressOne: configData.billToAddressOne,
  billToAddressTwo: configData.billToAddressTwo,
  rate: configData.hourlyRate,
  hoursWorkedDollarAmount,
  gstSubtotalDollarAmount,
  totalDollarAmount,
};

const outputFileName = configData.outputFilenamePrefix ? `${configData.outputFilenamePrefix}-invoice-${fileNameDate}.html` : `invoice-${fileNameDate}.html`;

ejs.renderFile(`${__dirname}/template/invoice.html`, data, function(err, str){
  if(err) {
    console.log(err);
  }
  
  fs.writeFile(`${__dirname}/${outputFileName}`, str, (err) => {
    if(err) {
      console.log(err);
    }
    
    console.log(`Wrote file ${outputFileName}`);
  })
});