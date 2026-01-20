# How to Verify Real Ship Data

This guide shows you exactly how to verify that you're receiving real ship data (not demo data) and how to track vessel voyages.

## 🔍 Quick Verification Steps

### 1. Check Data Sources
```bash
python manage_real_data.py --status
```

This shows:
- **Demo vessels**: Ships with hardcoded MMSIs (636019825, 353136000, etc.)
- **Real vessels**: Ships from actual AIS data
- **Recent activity**: How fresh your data is

### 2. Start Real Data Collection
```bash
python manage_real_data.py --start
```

This connects to aisstream.io and starts receiving live AIS data.

### 3. Monitor Progress
Wait 2-3 minutes, then check status again:
```bash
python manage_real_data.py --status
```

You should see:
- 📡 AIS Streaming: **Active**
- ⚡ Positions in last hour: **> 0**
- 🌍 Real vessels: **Increasing**

## 🚢 Identifying Real vs Demo Data

### Demo Vessels (Fake Data)
These are hardcoded ships that always appear in the same locations:
- **MSC Gülsün** (636019825) - Always near Rotterdam
- **Ever Ace** (353136000) - Always near Singapore  
- **OOCL Hong Kong** (477995300) - Always near Hong Kong
- **Symphony of the Seas** (311000274) - Always near Miami
- **Seaways Laura Lynn** (636017894) - Always near Kuwait

### Real Vessels (Live Data)
Real ships have:
- ✅ **Unique MMSIs** (not in the demo list above)
- ✅ **Recent timestamps** (within last few hours)
- ✅ **Realistic movements** (positions change over time)
- ✅ **Actual ship names** from maritime databases

## 🛣️ Voyage Tracking

### What are Voyages?
Voyages track a vessel's journey from one location to another. The system automatically:
- **Detects movement** when a ship travels significant distance
- **Identifies ports** based on geographic location
- **Calculates statistics** like distance, duration, and speed

### Process Voyages
```bash
python manage_real_data.py --process-voyages
```

This analyzes all vessel position data and creates voyage records.

### View Voyage Statistics
```bash
python manage_real_data.py --voyage-stats
```

Shows:
- Total voyages created
- Active vs completed voyages
- Distance and duration statistics

## 🌐 API Endpoints for Real Data

### Check Data Sources
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vessels/data-source-info/
```

### Start AIS Streaming
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8000/api/vessels/ais-start/
```

### Get Live Vessels
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vessels/live/
```

### Process Voyages
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vessels/voyages/update-all/
```

## 🔧 Troubleshooting

### "Still seeing same vessels"
This happens when:
1. **AIS streaming not started** - Run `python manage_real_data.py --start`
2. **Looking at old data** - Check timestamps in vessel positions
3. **Demo data mixed in** - Run `python manage_real_data.py --clear-demo`

### "No new positions"
Check:
1. **Internet connection** - AIS Stream requires stable connection
2. **API key validity** - Run `python verify_real_data.py`
3. **Firewall settings** - WebSocket connections must be allowed

### "Voyages not updating"
1. **Process voyages manually** - Run `python manage_real_data.py --process-voyages`
2. **Check position data** - Voyages need multiple positions to detect movement
3. **Verify timestamps** - Old positions won't create new voyages

## 📊 Real Data Indicators

### ✅ You have REAL data when:
- Vessel names are actual ship names (not generic)
- MMSIs are not in the demo list
- Positions have recent timestamps (< 1 hour old)
- Ships move between different locations over time
- New vessels appear regularly

### ❌ You have DEMO data when:
- Same 5 ships always appear
- Positions are always in same general areas
- Timestamps are old or don't update
- Ship names match the demo list exactly

## 🎯 Complete Verification Process

1. **Clear old demo data**:
   ```bash
   python manage_real_data.py --clear-demo
   ```

2. **Start real data collection**:
   ```bash
   python manage_real_data.py --start
   ```

3. **Wait 5 minutes** for data to arrive

4. **Check status**:
   ```bash
   python manage_real_data.py --status
   ```

5. **Process voyages**:
   ```bash
   python manage_real_data.py --process-voyages
   ```

6. **View results**:
   ```bash
   python manage_real_data.py --voyage-stats
   ```

## 🚀 Frontend Integration

Your frontend can now show:
- **Real-time ship positions** from live AIS data
- **Voyage tracking** with start/end ports
- **Data source indicators** (real vs demo)
- **Streaming status** in the UI

The vessels will now move realistically and show actual maritime traffic patterns!

## 📱 Next Steps

1. **Monitor for 30 minutes** to see ships moving
2. **Check voyage creation** as ships travel
3. **Integrate with frontend** to show live data
4. **Set up alerts** for specific vessels or areas
5. **Analyze traffic patterns** using voyage statistics

Your maritime platform now has access to real-time global ship movements! 🌍⚓