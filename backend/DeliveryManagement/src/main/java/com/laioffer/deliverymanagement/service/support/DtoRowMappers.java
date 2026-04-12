package com.laioffer.deliverymanagement.service.support;

import com.laioffer.deliverymanagement.dto.AppUserDto;
import com.laioffer.deliverymanagement.dto.DeliveryCenterDto;
import com.laioffer.deliverymanagement.dto.FleetVehicleDto;
import com.laioffer.deliverymanagement.dto.OrderDto;
import com.laioffer.deliverymanagement.dto.OrderParcelDto;
import com.laioffer.deliverymanagement.dto.OtpChallengeDto;
import com.laioffer.deliverymanagement.dto.PaymentDto;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.UUID;

public final class DtoRowMappers {

    private DtoRowMappers() {
    }

    public static AppUserDto mapAppUser(ResultSet rs, int rowNum) throws SQLException {
        return new AppUserDto(
                rs.getObject("id", UUID.class),
                rs.getString("email"),
                rs.getString("phone"),
                rs.getString("password_hash"),
                rs.getString("full_name"),
                rs.getBoolean("guest"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class),
                rs.getInt("version"),
                rs.getString("metadata")
        );
    }

    public static OtpChallengeDto mapOtpChallenge(ResultSet rs, int rowNum) throws SQLException {
        return new OtpChallengeDto(
                rs.getObject("id", UUID.class),
                rs.getObject("user_id", UUID.class),
                rs.getString("channel"),
                rs.getString("code_hash"),
                rs.getObject("expires_at", OffsetDateTime.class),
                rs.getBoolean("consumed"),
                rs.getShort("attempt_count"),
                rs.getObject("created_at", OffsetDateTime.class)
        );
    }

    public static DeliveryCenterDto mapDeliveryCenter(ResultSet rs, int rowNum) throws SQLException {
        return new DeliveryCenterDto(
                rs.getObject("id", UUID.class),
                rs.getString("name"),
                rs.getBigDecimal("latitude"),
                rs.getBigDecimal("longitude"),
                rs.getString("address_line"),
                rs.getString("service_area_geo"),
                rs.getString("metadata")
        );
    }

    public static FleetVehicleDto mapFleetVehicle(ResultSet rs, int rowNum) throws SQLException {
        return new FleetVehicleDto(
                rs.getObject("id", UUID.class),
                rs.getObject("center_id", UUID.class),
                rs.getString("vehicle_type"),
                rs.getBoolean("available"),
                rs.getString("external_device_id"),
                rs.getString("telemetry_hint"),
                rs.getString("metadata")
        );
    }

    public static OrderDto mapOrder(ResultSet rs, int rowNum) throws SQLException {
        return new OrderDto(
                rs.getObject("id", UUID.class),
                rs.getObject("user_id", UUID.class),
                rs.getObject("center_id", UUID.class),
                rs.getObject("fleet_vehicle_id", UUID.class),
                rs.getString("status"),
                rs.getString("vehicle_type_chosen"),
                rs.getString("pickup_summary"),
                rs.getString("dropoff_summary"),
                rs.getString("handoff_pin"),
                rs.getObject("estimated_minutes", Integer.class),
                rs.getBigDecimal("total_amount"),
                rs.getString("currency"),
                rs.getBigDecimal("sim_latitude"),
                rs.getBigDecimal("sim_longitude"),
                rs.getBigDecimal("sim_heading_deg"),
                rs.getObject("sim_updated_at", OffsetDateTime.class),
                rs.getString("plan_snapshot"),
                rs.getString("tracking_state"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class),
                rs.getInt("version"),
                rs.getString("metadata")
        );
    }

    public static OrderParcelDto mapOrderParcel(ResultSet rs, int rowNum) throws SQLException {
        return new OrderParcelDto(
                rs.getObject("id", UUID.class),
                rs.getObject("order_id", UUID.class),
                rs.getString("size_tier"),
                rs.getBigDecimal("weight_kg"),
                rs.getBoolean("fragile"),
                rs.getString("delivery_notes"),
                rs.getString("dimensions"),
                rs.getString("metadata")
        );
    }

    public static PaymentDto mapPayment(ResultSet rs, int rowNum) throws SQLException {
        return new PaymentDto(
                rs.getObject("id", UUID.class),
                rs.getObject("order_id", UUID.class),
                rs.getString("stripe_payment_intent_id"),
                rs.getString("status"),
                rs.getBigDecimal("amount"),
                rs.getString("currency"),
                rs.getString("idempotency_key"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class),
                rs.getString("provider_payload")
        );
    }
}
