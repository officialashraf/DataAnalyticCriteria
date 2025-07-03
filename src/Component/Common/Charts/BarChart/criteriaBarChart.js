// src/components/common/BarChart/ReusableBarChart.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import Cookies from 'js-cookie';
import Loader from '../../../Modules/Layout/loader';
import styles from './barchart.module.css';
import { useSelector } from 'react-redux';

const ReusableBarChartCriteria = ({
    caseId,
    aggsFields = [],
    chartHeight = 280,
    transformData = (rawData) => rawData.map(item => ({
        name: item.key,
        value: item.doc_count
    })),
    query = {},
    extraPayload = {}
}) => {
    const [barData, setBarData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const token = Cookies.get("accessToken");
   const queryPayload = useSelector((state) => state.criteriaKeywords.queryPayload);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                 const payload = {
                    query: {
                        unified_case_id: Array.isArray(queryPayload?.case_id) ? queryPayload.case_id : [],
                        file_type: Array.isArray(queryPayload?.file_type) ? queryPayload.file_type : [],
                        keyword: Array.isArray(queryPayload?.keyword) ? queryPayload.keyword : [],
                    },
                    aggs_fields: aggsFields,
                    start_time: queryPayload?.start_time || "",
                    end_time: queryPayload?.end_time || ""
                };

                const response = await axios.post(
                    `${window.runtimeConfig.REACT_APP_API_DAS_SEARCH}/api/das/aggregate`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
console.warn("Response from criteria", response)
                const field = aggsFields[0];
                const rawData = response.data[field] || [];
                const transformed = transformData(rawData);
                setBarData(transformed.length ? transformed : [{ name: 'No Data', value: 0 }]);

            } catch (error) {
                console.error('Error fetching bar chart data:', error);
                setBarData([{ name: 'No Data', value: 0 }]);
            } finally {
                setLoading(false);
            }
        };

        if (caseId) fetchData();
    }, [caseId, JSON.stringify(aggsFields), JSON.stringify(query), JSON.stringify(extraPayload), token]);

    if (loading) return <Loader />;

    return (
        <div className={styles.chartWrapper} style={{ height: chartHeight }}>
            {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(barData.length * 30, chartHeight)}>
                    <BarChart
                        data={barData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 8, width: 150, wordWrap: "break-word", fill: '#fff' }}
                        />
                        <Tooltip
                            wrapperStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                padding: "5px"
                            }}
                        />
                        <Bar
                            dataKey="value"
                            fill="#0e8df1"
                            barSize={15}
                            isAnimationActive={false}
                        >
                            {barData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === activeIndex ? "#555" : "#0e8df1"}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className={styles.noData}>No Data Available</div>
            )}
        </div>
    );
};

export default ReusableBarChartCriteria;
