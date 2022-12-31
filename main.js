// https://api.open-meteo.com/v1/forecast?latitude=11.01&longitude=76.99&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timezone=auto
const day ={
	0:"Sunday",
	1:"Monday",
	2:"Tuesday",
	3:"wednesday",
	4:"thursday",
	5:"Friday",
	6:"Saturday",
}


async function fetchWeather(){
    const URL = `https://api.open-meteo.com/v1/forecast?latitude=11.01&longitude=76.99&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timeformat=unixtime&timezone=auto`;
    const result = await fetch(`${URL}`);
    const data = await result.json();
	dayCard(data.daily);
	hourCard(data.hourly,data.current_weather);
	currentCard(data.current_weather,data.daily);
	document.body.classList.remove('blured');
}

fetchWeather();
// creating template for current

function setValue(selector,{parent=document}={},value)
{
	parent.querySelector(`[data-${selector}]`).textContent=value;
}

function currentCard(currentData,dailyData){
	const data=createCurrentData(currentData,dailyData);
	// icon
	const currentIcon = document.querySelector('[data-current-icon]');
	currentIcon.src= getUrl(data.iconCode);
	setValue("current-temp","document",data.currentTemp);
	setValue("current-high","document",data.hightTemp);
	setValue("current-low","document",data.lowTemp);
	setValue("current-fl-low","document",data.lowFeelsLike);
	setValue("current-fl-high","document",data.highFeelsLike);
	setValue("current-wind","document",data.windSpeed);
	setValue("current-precip","document",data.pricipitation);
	// background-change
	changeBackground(data.currentTemp);
}


// creating template for hour
const hourSection = document.querySelector("[data-hour-weather]");
const hourCardTemplate=document.getElementById('hour-row');
const hourFormater = new Intl.DateTimeFormat(undefined,{hour:"numeric"})
function hourCard(hourlyData,currentData)
{
	const data = createHourData(hourlyData,currentData);
	hourSection.innerHTML="";
	data.forEach(hour =>{
		const element = hourCardTemplate.content.cloneNode(true);
		setValue("current-temp",{parent:element},hour.temperature);
		setValue("current-fl-temp",{parent:element},hour.feelsLike);
		setValue("current-wind",{parent:element},hour.windSpeed);
		setValue("current-precip",{parent:element},hour.precipitation);
		setValue("date",{parent:element},dayFormater.format(hour.time));
		setValue("current-time",{parent:element},hourFormater.format(hour.time));
		element.querySelector('[data-hour-icon]').src=getUrl(hour.iconCode);
		hourSection.append(element);
	})
}
// creating template for daily
const dailySection = document.querySelector("[data-day-weather]");
const dayCardTemplate=document.getElementById('day-card');
const dayFormater = new Intl.DateTimeFormat(undefined,{weekday:"long"})
function dayCard(dailyData)
{
	const data = createDayData(dailyData);
	dailySection.innerHTML="";
	data.forEach(day =>{
		const element = dayCardTemplate.content.cloneNode(true);
		setValue("temp",{parent:element},day.maxTemp);
		setValue("date",{parent:element},dayFormater.format(day.time));
		element.querySelector('[data-icon]').src=getUrl(day.iconCode);
		dailySection.append(element);
	})
	
}


function getUrl(iconCode)
{
	return `./icons/${getIcon(iconCode)}.svg`
}

// change background color
function changeBackground(data)
{
	if(data<=25)
	{
		document.body.style.background="linear-gradient(to right,rgb(120, 240, 255),hsl(100, 65%, 80%))";

	}
	else if(data<=32)
	{
		document.body.style.background="linear-gradient(to right,rgb(140, 240, 255),hsl(59, 100%, 65%))";
		// console.log('change background');
	}else
	{
		document.body.style.background="linear-gradient(to right,rgb(205, 230, 172),hsl(59, 100%, 65%))";
		// console.log('change background');
	}
}
function getIcon(iconCode)
{
	const Icon_Map = new Map();
addMapping([0,1],"sun");
addMapping([2],"cloud-sun");
addMapping([3],"cloud");
addMapping([45,48],"smog");
addMapping([55,53,55,56,57,61,63,65,66,67,80,81,82],"cloud-showers-heavy");
addMapping([71,73,75,77,85,86],"snowflake");
addMapping([95,96,99],"cloud-bolt");
	function addMapping(value,icon)
	{
		value.forEach(value => {
			Icon_Map.set(value, icon);	
		});
	}  
	return Icon_Map.get(iconCode);
}

// transforming data
// current data transforming
function createCurrentData(currentData,dailyData)
{
	const {
		temperature:currentTemp,
		windspeed:windSpeed,
		weathercode:iconCode,
	} = currentData;
	const {
		temperature_2m_max:[maxTemp],
		temperature_2m_min:[minTemp],
		apparent_temperature_max:[maxFeelsLike],
		apparent_temperature_min:[minFeelsLike],
		precipitation_sum:[precipitation],
	}	= dailyData;

	return{
		currentTemp:Math.round(currentTemp),
		hightTemp:Math.round(maxTemp),
		lowTemp:Math.round(minTemp),
		highFeelsLike:Math.round(maxFeelsLike),
		lowFeelsLike:Math.round(minFeelsLike),
		windSpeed:Math.round(windSpeed),
		pricipitation:Math.round(precipitation*100)/100,
		iconCode,
	}
}
// day data transforming
function createDayData(dailyData){
	return dailyData.time.map((time,index)=>{
		return {
			time:time*1000,
			iconCode:dailyData.weathercode[index],
			maxTemp:Math.round(dailyData.temperature_2m_max[index]),
		}
	})
}
// hour data transforming
function createHourData(hourlyData,currentData){
	return hourlyData.time.map((time,index)=>{
		return{
			time:time*1000,
			iconCode:hourlyData.weathercode[index],
			temperature:Math.round(hourlyData.temperature_2m[index]),
			feelsLike:Math.round(hourlyData.apparent_temperature[index]),
			precipitation:Math.round(hourlyData.precipitation[index]*100)/100,
			windSpeed:Math.round(hourlyData.windspeed_10m[index]),
		}
	}).filter(({time})=> time>= currentData.time*1000);
}