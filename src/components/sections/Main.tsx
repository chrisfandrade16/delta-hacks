import { Button } from '@chakra-ui/react';
import { randomInt } from 'd3-random';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAllJSDocTags } from 'typescript';
import { generateAbbrev } from '../../utils/generateAbbrev';
import { ButtonEvent, ProvinceName } from '../../utils/types';
import { Projection } from '../atoms/Projection';
import { InfoContainer } from '../containers/InfoContainer';
import { SliderPanel } from '../containers/SliderPanel';

interface MainProps {
  // arr: string[];
}

export interface ICovidData {
  activeCases: number | string;
  dailyCases: number | string;
  culminativeCases: number | string;
  dailyDeaths: number | string;
  culminativeDeaths: number | string;
  dailyTested: number | string;
  culminativeTested: number | string;
  culminativeRecovered: number | string;
}

export const Main: React.FC<MainProps> = ({}) => {
  const [province, setProvince] = useState<string>('ontario');
  const [date, setDate] = useState<string>('11-09-2000');
  const [numberList, changeNumbersList] = useState<number[]>([]);
  const [caseGradient, setCaseGradient] = useState<boolean>(false);
  const [covidData, setCovidData] = useState<ICovidData>({
    activeCases: 0,
    dailyCases: 0,
    culminativeCases: 0,
    dailyDeaths: 0,
    culminativeDeaths: 0,
    dailyTested: 0,
    culminativeTested: 0,
    culminativeRecovered: 0,
  });

  const handleClick = (event: ButtonEvent, geo: any) => {
    setProvince(geo.properties.gn_name);
  };

  const handleToggler = () => {
    console.log(caseGradient);
    setCaseGradient(!caseGradient);
  };

  // API STUFF ============================================================

  const onSlide = async (date: string) => {
    setDate(date);
    let provinceAbbreviation = generateAbbrev(province); // generate abbreviations

    let dateArray = date.split('-');
    let selectedDateObject = new Date(
      parseInt(dateArray[2]),
      parseInt(dateArray[1]) - 1,
      parseInt(dateArray[0])
    );

    if (selectedDateObject.getTime() < Date.now()) {
      const response = await fetch(
        `https://api.opencovid.ca/timeseries?loc=${provinceAbbreviation}&date=${date}`
      );

      const data = await response.json();
      setCovidData({
        activeCases: data.active[0].active_cases,
        dailyCases: data.cases[0].cases,
        culminativeCases: data.active[0].cumulative_cases,
        dailyDeaths: data.mortality[0].deaths,
        culminativeDeaths: data.active[0].cumulative_deaths,
        dailyTested: data.testing[0].testing,
        culminativeTested: data.testing[0].cumulative_testing,
        culminativeRecovered: data.active[0].cumulative_recovered,
      });
      // console.log('wefwe');
      const responseCountry = await fetch(
        `https://api.opencovid.ca/timeseries?loc=prov&date=${date}`
      );
      const dataCountry = await responseCountry.json();

      changeNumbersList(getProvinceValues(dataCountry.cases));
    } else {
    }
  };

  // useEffect(() => {
  //   changeNumbersList(getProvinceValues());
  // }, [date]);

  return (
    <>
      <StyledContainer>
        <Projection
          onHover={handleClick}
          province={province}
          caseGradient={caseGradient}
          numberList={numberList}
        />
        <InfoContainer
          covidData={covidData}
          province={province}
          onTogglerClick={handleToggler}
          caseGradient={caseGradient}
        />
      </StyledContainer>

      <SliderPanel handleSlideChange={onSlide}></SliderPanel>
    </>
  );
};

/**
 * styled -------------------------------------------------------
 */
const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 1746px) {
    flex-direction: column;
  }
`;

function getProvinceValues(dataCountry: any): number[] {
  let arr: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // console.log(dataCountry);
  for (let item of dataCountry) {
    let pop;
    let cases = item.cumulative_cases;
    let location = 0;
    switch (item.province) {
      case 'Alberta': {
        pop = 4371000;
        location = 2;
        break;
      }
      case 'BC': {
        pop = 5071000;
        location = 3;
        break;
      }

      case 'New Bruinswick': {
        pop = 776827;
        location = 9;
        break;
      }
      case 'NL': {
        pop = 521542;
        location = 11;
        break;
      }
      case 'Nunavut': {
        pop = 38780;
        location = 4;
        break;
      }
      case 'Nova Scotia': {
        pop = 971395;
        location = 10;
        break;
      }
      case 'NWT': {
        pop = 44826;
        location = 5;
        break;
      }
      case 'Ontario': {
        pop = 14570000;
        location = 7;
        break;
      }
      case 'PEI': {
        pop = 156947;
        location = 12;
        break;
      }
      case 'Quebec': {
        pop = 8485000;
        location = 8;
        break;
      }
      case 'Saskatchewan': {
        pop = 1174000;
        location = 1;
        break;
      }
      case 'Yukon': {
        pop = 35874;
        location = 6;
        break;
      }
      default: {
        //manitoba values
        pop = 1369000;
        location = 0;
        break;
      }
    }

    arr[location] = getScore(pop, cases);
  }
  console.log(arr);
  return arr;
}

function getScore(pop: number, cases: number) {
  // console.log(pop);
  return (cases / pop) * 5000;
}
