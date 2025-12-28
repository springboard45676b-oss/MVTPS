from django.db import models


class Voyage(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.name











