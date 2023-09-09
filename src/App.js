import React, { useState } from 'react'
import './App.scss';
import { DatePicker, Button, InputNumber, Table } from 'antd';
import dayjs from 'dayjs';

const defaultReceivedMoney = {
  "1/2021": "2021-01-04",
  "2/2021": "2021-02-04",
  "3/2021": "2021-03-02",
  "4/2021": "2021-04-01",
  "5/2021": "2021-05-04",
  "6/2021": "2021-05-31",
  "7/2021": "2021-07-02",
  "8/2021": "2021-07-02",
  "9/2021": "2021-08-31",
  "10/2021": "2021-08-31",
  "11/2021": "2021-11-04",
  "12/2021": "2021-12-02",
  "2/2022": "2021-12-31",
  "1/2022": "2021-12-31",
  "3/2022": "2022-03-02",
  "4/2022": "2022-04-04",
  "5/2022": "2022-05-04",
  "6/2022": "2022-06-02",
  "7/2022": "2022-06-30",
  "8/2022": "2022-08-02",
  "9/2022": "2022-08-31",
  "10/2022": "2022-10-03",
  "11/2022": "2022-11-02",
  "12/2022": "2022-12-02",
  "1/2023": "2022-12-29",
  "2/2023": "2022-12-29",
  "3/2023": "2023-02-28",
  "4/2023": "2023-03-30",
  "5/2023": "2023-04-28",
  "6/2023": "2023-06-01",
  "7/2023": "2023-06-30",
  "8/2023": "2023-08-11",
  "9/2023": "2023-09-09",
  "10/2023": "2023-09-09",
  "11/2023": "2023-09-09",
  "12/2023": "2023-09-09"
}

function App() {
  const [dateBegin, setDateBegin] = useState((new Date()).toISOString().split('T')[0]);
  const [dateEnd, setDateEnd] = useState((new Date()).toISOString().split('T')[0]);
  const [datePay, setDatePay] = useState((new Date()).toISOString().split('T')[0]);

  const [interestRates, setInterestRates] = useState([]);
  const [receivedDates, setReceivedDate] = useState([]);
  const [moneyConfigs, setMoneyConfigs] = useState([]);

  const [result, setResult] = useState({
    columns: [],
    dataSource: []
  });
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalReceivedMoney, setTotalReceivedMoney] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const handleRenderMoneyInput = () => {
    const fromYear = (new Date(dateBegin)).getFullYear();
    const toYear = (new Date(dateEnd)).getFullYear();
    const newReceivedDates = [];
    const newMoneyConfigs = [];
    const newInterestRates = [];
    for (let i = fromYear; i <= toYear; i++) {
      const newItemDate = {
        year: i,
        dates: []
      }
      const newItemMoney = {
        year: i,
        moneys: []
      }
      const newItemInterestRate = {
        year: i,
        value: 0
      }
      for (let j = 1; j <= 12; j++) {
        if (defaultReceivedMoney[j + "/" + i] !== undefined) {
          newItemDate.dates.push(defaultReceivedMoney[j + "/" + i]);
        } else {
          newItemDate.dates.push((new Date()).toISOString().split('T')[0]);
        }
        newItemMoney.moneys.push(0)
      }
      newReceivedDates.push(newItemDate);
      newMoneyConfigs.push(newItemMoney);
      newInterestRates.push(newItemInterestRate);
    }
    setReceivedDate(newReceivedDates);
    setMoneyConfigs(newMoneyConfigs);
    setInterestRates(newInterestRates);
  }

  const handleChangeInterestRate = (year, value) => {
    const newInterestRates = [...interestRates];
    newInterestRates.find(ir => {
      return ir.year === year;
    }).value = value;
    setInterestRates(newInterestRates);
  }

  const handleChangeDateReceived = (index, year, value) => {
    const newReceivedDates = [...receivedDates];
    newReceivedDates.find(rd => {
      return rd.year === year;
    }).dates[index] = value;
    setReceivedDate(newReceivedDates);
  }

  const handleChangeMoney = (index, year, value) => {
    const newMoneyConfigs = [...moneyConfigs];
    newMoneyConfigs.find(mc => {
      return mc.year === year;
    }).moneys[index] = value;
    setMoneyConfigs(newMoneyConfigs);
  }

  const handleCalculate = () => {
    const newResult = {
      columns: [],
      dataSource: []
    }

    const totalDayKey = []

    for (let ir of interestRates) {
      const dayKey = "totalDay_" + ir.year;
      const interestKey = "totalInterest_" + ir.year;
      totalDayKey.push({
        title: ir.year,
        dataIndex: dayKey,
        key: dayKey,
      });
      totalDayKey.push({
        title: "Lãi " + ir.year,
        dataIndex: interestKey,
        key: interestKey,
      });
    }
    newResult.columns = [
      {
        title: 'Tháng',
        dataIndex: 'month',
        key: 'month',
      },
      {
        title: 'Số tiền',
        dataIndex: 'money',
        key: 'money',
      },
      ...totalDayKey
    ]
    let newTotalInterest = 0;
    let newTotalReceivedMoney = 0;
    let newTotalAll = 0;

    const dateBeginObj = new Date(dateBegin);
    const dateEndObj = new Date(dateEnd);
    for (let ird = 0; ird < receivedDates.length; ird++) {
      const rd = receivedDates[ird];
      for (let iDate = 0; iDate < rd.dates.length; iDate++) {
        const receivedMoney = moneyConfigs[ird].moneys[iDate];
        newTotalReceivedMoney += receivedMoney;
        const resultItem = {
          key: rd.year + "_" + iDate,
          month: (iDate + 1) + "/" + rd.year,
          money: receivedMoney.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })
        }
        const receivedDateObj = new Date(rd.dates[iDate]);
        receivedDateObj.setDate(receivedDateObj.getDate() + 1);
        if (dateEndObj >= receivedDateObj && receivedDateObj >= dateBeginObj) {
          let prevTotalDay = 0;
          for (let iir = 0; iir < interestRates.length; iir++) {
            const ir = interestRates[iir];
            let dateCalculate = new Date(datePay);
            dateCalculate.setDate(dateCalculate.getDate() - 1);
            console.log(dateCalculate)
            const lastDateOfYear = new Date(ir.year, 11, 31);
            if (lastDateOfYear < dateCalculate) {
              dateCalculate = lastDateOfYear;
            }
            let distance = Math.ceil((dateCalculate.getTime() - receivedDateObj.getTime()) / (1000 * 3600 * 24)) + 1 - Math.abs(prevTotalDay);
            if (distance < 0) {
              distance = 0;
            }

            prevTotalDay += distance;
            resultItem["totalDay_" + ir.year] = distance;

            const interestMoney = distance * ir.value * receivedMoney;
            newTotalInterest += interestMoney;
            resultItem["totalInterest_" + ir.year] = interestMoney.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
          }
        }
        newResult.dataSource.push(resultItem);
      }
    }
    newTotalAll = newTotalInterest + newTotalReceivedMoney;
    setTotalAll(newTotalAll);
    setTotalReceivedMoney(newTotalReceivedMoney);
    setTotalInterest(newTotalInterest);
    setResult(newResult);
  }
  return (
    <div className="App">
      <div
        className="date-config"
      >
        <div
          className="date-config__date-begin"
        >
          <div
            className="date-config__date-begin__title"
          >
            Ngày bắt đầu tính lãi
          </div>
          <div>
            <DatePicker
              allowClear={false}
              value={dayjs(dateBegin)}
              onChange={(d, ds) => { setDateBegin(ds) }}
            />
          </div>
        </div>

        <div
          className="date-config__date-end"
        >
          <div
            className="date-config__date-end__title"
          >
            Ngày ngừng nhận tiền
          </div>
          <div>
            <DatePicker
              allowClear={false}
              value={dayjs(dateEnd)}
              onChange={(d, ds) => { setDateEnd(ds); }}
            />
          </div>
        </div>

        <div
          className="date-config__date-end"
        >
          <div
            className="date-config__date-end__title"
          >
            Ngày đóng tiền
          </div>
          <div>
            <DatePicker
              allowClear={false}
              value={dayjs(datePay)}
              onChange={(d, ds) => { setDatePay(ds); }}
            />
          </div>
        </div>
        <div
          className="date-config__ok-button"
        >
          <Button
            type="primary"
            onClick={handleRenderMoneyInput}
          >OK</Button>
        </div>
      </div>
      <div
        className="interest-rate-config"
      >
        <h3>Lãi suất/ngày</h3>
        <div
          className="interest-rate-config__list-item"
        >
          {interestRates.map((ir, index) => {
            return (
              <div
                key={index}
                className="interest-rate-config__item"
              >
                <div>Năm {ir.year}</div>
                <InputNumber
                  style={{ width: '100%' }}
                  value={ir.value}
                  decimalSeparator="."
                  onChange={(value) => { handleChangeInterestRate(ir.year, value) }}
                />
              </div>
            )
          })}
        </div>
      </div>
      <div
        className="date-received-config"
      >
        <h3>Ngày nhận tiền</h3>
        <div>
          {receivedDates.map((rd, indexRD) => {
            return (
              <div
                key={indexRD}
                className="date-received-config__item"
              >
                <div>{rd.year}</div>
                <div
                  className="date-received-config__item__list-date"
                >
                  {rd.dates.map((date, index) => {
                    return (
                      <div
                        key={index}
                        className="date-received-config__item__list-date__date-item"
                      >
                        <div>Tháng {index + 1}</div>
                        <DatePicker
                          allowClear={false}
                          value={dayjs(date)}
                          onChange={(d, ds) => { handleChangeDateReceived(index, rd.year, ds) }}
                        />
                      </div>

                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
      <div
        className="money-config"
      >
        <h3>Số tiền đã chuyển</h3>
        <div>
          {moneyConfigs.map((mc, indexMC) => {
            return (
              <div
                key={indexMC}
                className="money-config__item"
              >
                <div>{mc.year}</div>
                <div
                  className="money-config__item__list-money"
                >
                  {mc.moneys.map((money, index) => {
                    return (
                      <div
                        key={index}
                        className="money-config__item__list-money__money-item"
                      >
                        <div>Tháng {index + 1}</div>
                        <InputNumber
                          defaultValue={0}
                          style={{ width: '100%' }}
                          onChange={(value) => { handleChangeMoney(index, mc.year, value) }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div
        className="calculate-button"
      >
        <Button
          type="primary"
          onClick={handleCalculate}
        >Tính</Button>
      </div>
      <div
        className="result-table"
      >
        <Table
          dataSource={result.dataSource}
          columns={result.columns}
          pagination={false}
        />
      </div>
      <div
        className="total-result"
      >
        <div>Tổng lãi: {totalInterest.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</div>
        <div>Tổng tiền đã nhận: {totalReceivedMoney.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</div>
        <div>Tổng tiền cần thu hồi: {totalAll.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</div>
      </div>
    </div>
  );
}

export default App;
