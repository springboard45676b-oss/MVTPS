from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Port
from .serializers import PortSerializer


@api_view(['GET'])
def port_list(request):
    """
    List all ports with congestion stats
    """
    ports = Port.objects.all().order_by('-congestion_score')
    serializer = PortSerializer(ports, many=True)
    return Response(serializer.data)
