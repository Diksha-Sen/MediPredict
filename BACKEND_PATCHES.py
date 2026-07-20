# ═══════════════════════════════════════════════════════════════════════════════
# BACKEND PATCHES — All 5 Issues
# ═══════════════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────────────
# ISSUE #1 — Patient name in appointments
# Edit: appointments/serializers.py
# Replace the entire AppointmentSerializer with this:
# ─────────────────────────────────────────────────────────────────────────────
"""
from rest_framework import serializers
from users.serializers import UserSerializer
from doctors.serializers import DoctorSerializer
from .models import Appointment, PatientHistoryEntry, Review


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name  = serializers.SerializerMethodField()
    patient_email = serializers.SerializerMethodField()
    doctor_name   = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id", "user", "patient_name", "patient_email",
            "doctor", "doctor_name",
            "date", "time", "reason", "status", "prediction",
        ]
        read_only_fields = ["id", "user", "status"]

    def get_patient_name(self, obj):
        return obj.user.name if obj.user else None

    def get_patient_email(self, obj):
        return obj.user.email if obj.user else None

    def get_doctor_name(self, obj):
        return obj.doctor.user.name if obj.doctor and obj.doctor.user else None
"""

# ─────────────────────────────────────────────────────────────────────────────
# ISSUE #2 — License file visible in admin
# Edit: doctors/serializers.py
# Add license_file to DoctorSerializer:
# ─────────────────────────────────────────────────────────────────────────────
"""
class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    license_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            "id", "user", "specialization", "hospital",
            "experience_years", "is_verified", "rating",
            "license_file", "license_file_url",
        ]

    def get_license_file_url(self, obj):
        request = self.context.get('request')
        if obj.license_file and request:
            return request.build_absolute_uri(obj.license_file.url)
        return None
"""
# Also add MEDIA settings to settings.py so files can be served:
"""
# settings.py — add at bottom
import os
MEDIA_URL  = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
"""
# And in backend/urls.py — add media serving in development:
"""
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... existing paths ...
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
"""

# ─────────────────────────────────────────────────────────────────────────────
# ISSUE #4 — Doctor availability slots
# Add a new model + views + urls to doctors app
# ─────────────────────────────────────────────────────────────────────────────

# Step A: Add to doctors/models.py (at the bottom)
"""
class DoctorAvailability(models.Model):
    DAYS = [
        ('MON','Monday'),('TUE','Tuesday'),('WED','Wednesday'),
        ('THU','Thursday'),('FRI','Friday'),('SAT','Saturday'),('SUN','Sunday'),
    ]
    doctor     = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availability')
    day        = models.CharField(max_length=3, choices=DAYS)
    start_time = models.TimeField()   # e.g. 09:00
    end_time   = models.TimeField()   # e.g. 17:00
    slot_mins  = models.PositiveIntegerField(default=30)  # slot duration in minutes

    class Meta:
        unique_together = ('doctor', 'day')

    def __str__(self):
        return f"{self.doctor.user.name} — {self.day} {self.start_time}–{self.end_time}"
"""

# Step B: Add to doctors/serializers.py
"""
class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model  = DoctorAvailability
        fields = ['id', 'day', 'start_time', 'end_time', 'slot_mins']
"""

# Step C: Add to doctors/views.py
"""
from .models import DoctorAvailability
from .serializers import DoctorAvailabilitySerializer

class DoctorSlotsView(generics.ListCreateAPIView):
    \"\"\"Doctor manages their own availability slots.\"\"\"
    serializer_class = DoctorAvailabilitySerializer

    def get_queryset(self):
        return DoctorAvailability.objects.filter(doctor__user=self.request.user)

    def perform_create(self, serializer):
        doctor = Doctor.objects.get(user=self.request.user)
        # Replace existing slot for that day if exists
        DoctorAvailability.objects.filter(doctor=doctor, day=serializer.validated_data['day']).delete()
        serializer.save(doctor=doctor)


class PublicDoctorSlotsView(generics.ListAPIView):
    \"\"\"Anyone can see a doctor's available slots.\"\"\"
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return DoctorAvailability.objects.filter(doctor_id=self.kwargs['pk'])
"""

# Step D: Add to doctors/urls.py
"""
from .views import DoctorSlotsView, PublicDoctorSlotsView

path("doctors/slots/",           DoctorSlotsView.as_view(),       name="doctor-slots"),
path("doctors/<int:pk>/slots/",  PublicDoctorSlotsView.as_view(), name="doctor-public-slots"),
"""

# Step E: Run migrations
"""
python manage.py makemigrations doctors
python manage.py migrate
"""

# ─────────────────────────────────────────────────────────────────────────────
# ISSUE #5 — Confidence score too low
# The thresholds are too strict for a multi-class ML model.
# Edit: predictions/views.py — lower the thresholds
# ─────────────────────────────────────────────────────────────────────────────
"""
# Replace this block in PredictionListCreateView.post():

# OLD (too strict):
if confidence >= 0.8:
    status_value = Prediction.Status.HIGH_CONFIDENCE
elif 0.5 <= confidence < 0.8:
    status_value = Prediction.Status.MODERATE_CONFIDENCE
else:
    status_value = Prediction.Status.LOW_CONFIDENCE

# NEW (realistic for multi-class models):
if confidence >= 0.5:
    status_value = Prediction.Status.HIGH_CONFIDENCE
elif confidence >= 0.3:
    status_value = Prediction.Status.MODERATE_CONFIDENCE
else:
    status_value = Prediction.Status.LOW_CONFIDENCE
"""
# WHY: Multi-class models (26+ disease classes) naturally spread probability
# across many classes. A confidence of 0.5 in a 26-class model is actually
# very strong — it means the model is twice as sure as random chance.
# The old thresholds (0.8) were designed for binary classifiers.

# Also: use RF probability as primary confidence since RF is most reliable:
"""
# In ml_engine/predict.py, optionally change the confidence calculation:
# OLD:
confidence = float((rf_p + nb_p + dt_p) / 3.0)

# NEW (weight RF more heavily as it's the primary model):
confidence = float((rf_p * 0.5) + (nb_p * 0.25) + (dt_p * 0.25))
"""

# ─────────────────────────────────────────────────────────────────────────────
# ISSUE #1, #2, #7 — Admin views need select_related for names
# Edit: appointments/views.py — update AdminAppointmentListView
# ─────────────────────────────────────────────────────────────────────────────
"""
class AdminAppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAdminRole]
    def get_queryset(self):
        return Appointment.objects.select_related(
            'user', 'doctor', 'doctor__user'
        ).order_by('-date', '-time')
"""
