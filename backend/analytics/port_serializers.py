# Add these serializers to your existing serializers.py file

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'code', 'name', 'region']

class ShipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipType
        fields = ['id', 'code', 'name', 'description']

class PortCallStatisticSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    ship_type_name = serializers.CharField(source='ship_type.name', read_only=True)
    
    class Meta:
        model = PortCallStatistic
        fields = ['id', 'year', 'country', 'country_name', 'ship_type', 'ship_type_name', 'port_calls']

class PortCongestionMetricSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    
    class Meta:
        model = PortCongestionMetric
        fields = ['id', 'country', 'country_name', 'year', 'total_port_calls', 
                 'congestion_index', 'efficiency_score', 'container_calls', 
                 'bulk_calls', 'passenger_calls']