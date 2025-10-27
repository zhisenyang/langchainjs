/**
 * API 链式处理示例
 * 
 * 这个文件演示了如何使用 APIChain 来集成外部 API 服务。
 * 主要功能：
 * 
 * 1. API 文档集成：
 *    - 使用详细的 API 文档字符串
 *    - 定义 Open-Meteo 天气 API 的完整规范
 *    - 包含参数格式、类型和描述信息
 * 
 * 2. 智能 API 调用：
 *    - 使用 APIChain.fromLLMAndAPIDocs 创建链
 *    - LLM 自动解析自然语言查询
 *    - 生成正确的 API 请求参数
 * 
 * 3. 自然语言接口：
 *    - 支持自然语言问题输入
 *    - 自动转换为 API 调用
 *    - 返回结构化的响应数据
 * 
 * 4. 天气数据查询：
 *    - 地理坐标定位
 *    - 多种天气变量支持
 *    - 时区和单位转换
 * 
 * 5. 实际应用场景：
 *    - 天气信息查询
 *    - 地理位置服务
 *    - 实时数据获取
 * 
 * 使用场景：
 * - 天气应用开发
 * - 地理信息系统
 * - 智能助手集成
 * - 数据分析平台
 * - 实时监控系统
 */

import { OpenAI } from "@langchain/openai";
import { APIChain } from "@langchain/classic/chains";

const OPEN_METEO_DOCS = `BASE URL: https://api.open-meteo.com/

API Documentation
The API endpoint /v1/forecast accepts a geographical coordinate, a list of weather variables and responds with a JSON hourly weather forecast for 7 days. Time always starts at 0:00 today and contains 168 hours. All URL parameters are listed below:

Parameter	Format	Required	Default	Description
latitude, longitude	Floating point	Yes		Geographical WGS84 coordinate of the location
hourly	String array	No		A list of weather variables which should be returned. Values can be comma separated, or multiple &hourly= parameter in the URL can be used.
daily	String array	No		A list of daily weather variable aggregations which should be returned. Values can be comma separated, or multiple &daily= parameter in the URL can be used. If daily weather variables are specified, parameter timezone is required.
current_weather	Bool	No	false	Include current weather conditions in the JSON output.
temperature_unit	String	No	celsius	If fahrenheit is set, all temperature values are converted to Fahrenheit.
windspeed_unit	String	No	kmh	Other wind speed speed units: ms, mph and kn
precipitation_unit	String	No	mm	Other precipitation amount units: inch
timeformat	String	No	iso8601	If format unixtime is selected, all time values are returned in UNIX epoch time in seconds. Please note that all timestamp are in GMT+0! For daily values with unix timestamps, please apply utc_offset_seconds again to get the correct date.
timezone	String	No	GMT	If timezone is set, all timestamps are returned as local-time and data is returned starting at 00:00 local-time. Any time zone name from the time zone database is supported. If auto is set as a time zone, the coordinates will be automatically resolved to the local time zone.
past_days	Integer (0-2)	No	0	If past_days is set, yesterday or the day before yesterday data are also returned.
start_date
end_date	String (yyyy-mm-dd)	No		The time interval to get weather data. A day must be specified as an ISO8601 date (e.g. 2022-06-30).
models	String array	No	auto	Manually select one or more weather models. Per default, the best suitable weather models will be combined.

Variable	Valid time	Unit	Description
temperature_2m	Instant	°C (°F)	Air temperature at 2 meters above ground
snowfall	Preceding hour sum	cm (inch)	Snowfall amount of the preceding hour in centimeters. For the water equivalent in millimeter, divide by 7. E.g. 7 cm snow = 10 mm precipitation water equivalent
rain	Preceding hour sum	mm (inch)	Rain from large scale weather systems of the preceding hour in millimeter
showers	Preceding hour sum	mm (inch)	Showers from convective precipitation in millimeters from the preceding hour
weathercode	Instant	WMO code	Weather condition as a numeric code. Follow WMO weather interpretation codes. See table below for details.
snow_depth	Instant	meters	Snow depth on the ground
freezinglevel_height	Instant	meters	Altitude above sea level of the 0°C level
visibility	Instant	meters	Viewing distance in meters. Influenced by low clouds, humidity and aerosols. Maximum visibility is approximately 24 km.`;

export async function run() {
  const model = new OpenAI({ model: "gpt-3.5-turbo-instruct" });
  const chain = APIChain.fromLLMAndAPIDocs(model, OPEN_METEO_DOCS, {
    headers: {
      // These headers will be used for API requests made by the chain.
    },
  });

  const res = await chain.invoke({
    question:
      "What is the weather like right now in Munich, Germany in degrees Farenheit?",
  });
  console.log({ res });
}
