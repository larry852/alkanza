from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.orm import backref, relationship
from .database import Base
import datetime
from sqlalchemy.sql import func


class Request(Base):
    __tablename__ = 'requests'
    id = Column(Integer, primary_key=True)
    radius = Column(Integer)
    location_id = Column(Integer, ForeignKey('locations.id'), unique=True)
    location = relationship(
        "Location", backref=backref("requests", uselist=False))
    distance_imbalance = Column(Float(precision=64))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    medical_centers = relationship("MedicalCenter", back_populates="request")


class Location(Base):
    __tablename__ = 'locations'
    id = Column(Integer, primary_key=True)
    latitude = Column(Float(precision=64))
    longitude = Column(Float(precision=64))


class MedicalCenter(Base):
    __tablename__ = 'medical_centers'
    id = Column(Integer, primary_key=True)
    balanced = Column(Boolean)
    distance = Column(Float(precision=64))
    location_id = Column(Integer, ForeignKey('locations.id'), unique=True)
    location = relationship(
        "Location", backref=backref("medical_centers", uselist=False))
    name = Column(String(120))
    request_id = Column(Integer, ForeignKey('requests.id'))
    request = relationship("Request", back_populates="medical_centers")
