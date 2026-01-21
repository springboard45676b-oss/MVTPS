import requests

def get_unctad_data(country_code="IN"):
    """
    Fetches real UNCTAD data via World Bank API.
    Sources: 
    - LSCI (Connectivity): IS.SHP.GCNW.XQ
    - Port Traffic (TEU): IS.SHP.GOOD.TU
    """
    stats = {
        "lsci": "N/A",
        "lsci_year": "N/A",
        "traffic": "N/A",
        "traffic_year": "N/A"
    }

    # 1. Fetch LSCI (Connectivity Index)
    lsci_url = f"http://api.worldbank.org/v2/country/{country_code}/indicator/IS.SHP.GCNW.XQ?format=json&per_page=1"
    try:
        response = requests.get(lsci_url)
        data = response.json()
        if len(data) > 1 and data[1]:
            entry = data[1][0]
            stats["lsci"] = round(entry['value'], 2) if entry['value'] else "N/A"
            stats["lsci_year"] = entry['date']
    except Exception as e:
        print(f"LSCI Error: {e}")

    # 2. Fetch Port Traffic (Container Throughput)
    traffic_url = f"http://api.worldbank.org/v2/country/{country_code}/indicator/IS.SHP.GOOD.TU?format=json&per_page=1"
    try:
        response = requests.get(traffic_url)
        data = response.json()
        if len(data) > 1 and data[1]:
            entry = data[1][0]
            # Convert to millions for easier reading
            val = entry['value']
            if val:
                stats["traffic"] = f"{round(val / 1000000, 2)}M TEU"
            stats["traffic_year"] = entry['date']
    except Exception as e:
        print(f"Traffic Error: {e}")

    return stats