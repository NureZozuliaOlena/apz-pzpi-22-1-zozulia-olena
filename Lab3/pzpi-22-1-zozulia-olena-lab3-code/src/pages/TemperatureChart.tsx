import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Box, CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface TemperatureLog {
  id: string;
  fridgeId: string;
  timestamp: string;
  temperature: number;
}

interface Fridge {
  id: string;
  name?: string;
  company?: {
    name: string;
  };
}

interface FormattedTemperatureLog extends TemperatureLog {
  time: string;
  date: string;
}

const api = axios.create({
  baseURL: 'http://localhost:5235/api/',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

const fetchTemperatureLogs = async (fridgeId: string): Promise<TemperatureLog[]> => {
  const response = await api.get(`device/fridge/${fridgeId}/temperature-logs`);
  return response.data;
};

const fetchFridges = async (): Promise<Fridge[]> => {
  const response = await api.get('Fridge');
  return response.data;
};

const TemperatureChart: React.FC<{ fridgeId: string }> = ({ fridgeId }) => {
      const { t } = useTranslation();
  const [data, setData] = useState<FormattedTemperatureLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fridgeId) {
      setData([]);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const logs = await fetchTemperatureLogs(fridgeId);
        const formatted = logs.map(log => ({
          ...log,
          time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(log.timestamp).toLocaleDateString()
        }));
        setData(formatted);
      } catch (err) {
        setError('Failed to load temperature data');
        console.error('Failed to load temperature data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fridgeId]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
      <Typography color="error">{t('charts.errorLoadingData')}</Typography>
    </Box>
  );

  if (!data.length) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
      <Typography>{t('charts.noData')}</Typography>
    </Box>
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          label={{ value: t('charts.time'), position: 'bottom', offset: 10 }}
        />
        <YAxis
          label={{ value: t('charts.temperatureAxis'), angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value} °C`, t('charts.temperatureAxis')]}
          labelFormatter={(label) => `${t('charts.time')}: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="temperature" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }}
          name={t('charts.temperature')}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const TemperatureMonitoringPage: React.FC = () => {
          const { t } = useTranslation();
  const [fridgeId, setFridgeId] = useState('');
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFridges = async () => {
      setLoading(true);
      try {
        const data = await fetchFridges();
        setFridges(data);
      } catch (err) {
        setError('Failed to load fridges');
        console.error('Failed to load fridges:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFridges();
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    setFridgeId(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('charts.monitoring')}
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }} disabled={loading}>
        <InputLabel>{t('charts.fridgeLabel')}</InputLabel>
        <Select
          value={fridgeId}
          onChange={handleChange}
          label={t('charts.fridgeLabel')}
        >
          <MenuItem value="">
            <em>{t('charts.selectFridge')}</em>
          </MenuItem>
          {fridges.map(fridge => (
            <MenuItem key={fridge.id} value={fridge.id}>
              {fridge.company?.name || fridge.name || t('charts.fridgeLabel')} #{fridge.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TemperatureChart fridgeId={fridgeId} />
    </Box>
  );
};

export default TemperatureMonitoringPage;