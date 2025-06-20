import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import WordCloud from 'react-d3-cloud';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Cookies from "js-cookie";
import Loader from '../../Layout/loader';
import { ResponsiveContainer } from 'recharts';

const KeywordChart = () => {
  const token = Cookies.get("accessToken");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const caseId = useSelector((state) => state.caseData.caseData.id);

  useEffect(() => {
    const fetchKeywordData = async () => {
      try {
        setLoading(true);
        const payload = {
          query: { unified_case_id: String(caseId) },
          aggs_fields: ["unified_record_type", "unified_date_only", "unified_type", "socialmedia_hashtags"]

        }
        const response = await axios.post(`${window.runtimeConfig.REACT_APP_API_DAS_SEARCH}/api/das/aggregate`, payload
          , {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },

        );
        console.log("querypaylodkeyword", payload)
        console.log("KeywordCloud---", response);

        const { socialmedia_hashtags } = response.data;
        if (socialmedia_hashtags) {
          setData(socialmedia_hashtags);
        } else {
          setData([]); // Set data to an empty array if socialmedia_hashtags is undefined
        }
      } catch (error) {
        setData([]);
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    }
    fetchKeywordData();
  },
    [caseId, token]);

  if (loading) {
    return <Loader />;
  }

  const dataa =
    data &&
    data.map(item => ({
      text: item.key, // ✅ WordCloud me "key" dikhega
      value: item.doc_count // ✅ "doc_count" ke mutaabiq size badhega
    }));

  const fontSizeMapper = word => Math.log2(word.value + 1) * 50; // Size adjust kiya
  const rotate = () => 0; //  Fixed rotation (seedha text dikhane ke liye)

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <Box width='100%' style={{ marginTop: 0, padding: 0, alignContent: 'center' }}>
          {data.length > 0
            ? <WordCloud
              data={dataa}
              fontSizeMapper={fontSizeMapper}
              rotate={rotate}
              margin={0}
              width={600}
              height={280}
            />
            :
            <div className="h-[150px] flex items-center justify-center">
              <p className="text-gray-500 text-xl">No Data Available</p>
            </div>
          }
        </Box>
      </ResponsiveContainer>
    </div>
  );
};

export default KeywordChart;
