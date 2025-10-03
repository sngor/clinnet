// Modern widget presets for common dashboard use cases
import React from "react";
import ModernWidget from "./ModernWidget";
import {
  Person as PersonIcon,
  Event as EventIcon,
  LocalHospital as LocalHospitalIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

/**
 * Metric widget for displaying key performance indicators
 */
export const MetricWidget = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color = "primary",
  icon,
  onClick,
  loading = false,
  ...props
}) => (
  <ModernWidget
    title={title}
    value={value}
    subtitle={subtitle}
    icon={icon}
    color={color}
    trend={trend}
    trendValue={trendValue}
    onClick={onClick}
    loading={loading}
    size="medium"
    variant="default"
    {...props}
  />
);

/**
 * Status widget for displaying system status or alerts
 */
export const StatusWidget = ({
  title,
  status,
  description,
  color = "primary",
  icon,
  onClick,
  ...props
}) => (
  <ModernWidget
    title={title}
    description={description}
    status={status}
    icon={icon}
    color={color}
    onClick={onClick}
    layout="horizontal"
    size="small"
    variant="flat"
    {...props}
  />
);

/**
 * Action widget for quick actions or navigation
 */
export const ActionWidget = ({
  title,
  description,
  icon,
  color = "primary",
  onClick,
  href,
  ...props
}) => (
  <ModernWidget
    title={title}
    description={description}
    icon={icon}
    color={color}
    onClick={onClick}
    href={href}
    layout="vertical"
    size="medium"
    variant="elevated"
    {...props}
  />
);

/**
 * Content widget for displaying rich content
 */
export const ContentWidget = ({ title, children, onMenuClick, ...props }) => (
  <ModernWidget
    title={title}
    onMenuClick={onMenuClick}
    layout="content-only"
    size="large"
    variant="default"
    {...props}
  >
    {children}
  </ModernWidget>
);

/**
 * Gradient widget for highlighting important metrics
 */
export const HighlightWidget = ({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  onClick,
  ...props
}) => (
  <ModernWidget
    title={title}
    value={value}
    subtitle={subtitle}
    icon={icon}
    color={color}
    onClick={onClick}
    size="medium"
    variant="gradient"
    {...props}
  />
);

/**
 * Predefined widgets for common healthcare dashboard metrics
 */

// Patient metrics
export const PatientCountWidget = ({
  count,
  trend,
  trendValue,
  onClick,
  loading,
}) => (
  <MetricWidget
    title="Total Patients"
    value={count}
    subtitle="Registered patients"
    icon={PersonIcon}
    color="primary"
    trend={trend}
    trendValue={trendValue}
    onClick={onClick}
    loading={loading}
  />
);

export const TodayPatientsWidget = ({ count, onClick, loading }) => (
  <MetricWidget
    title="Today's Patients"
    value={count}
    subtitle="Scheduled for today"
    icon={ScheduleIcon}
    color="info"
    onClick={onClick}
    loading={loading}
  />
);

// Appointment metrics
export const AppointmentCountWidget = ({
  count,
  trend,
  trendValue,
  onClick,
  loading,
}) => (
  <MetricWidget
    title="Appointments"
    value={count}
    subtitle="Total scheduled"
    icon={EventIcon}
    color="secondary"
    trend={trend}
    trendValue={trendValue}
    onClick={onClick}
    loading={loading}
  />
);

export const TodayAppointmentsWidget = ({ count, onClick, loading }) => (
  <HighlightWidget
    title="Today's Appointments"
    value={count}
    subtitle="Scheduled for today"
    icon={EventIcon}
    color="primary"
    onClick={onClick}
    loading={loading}
  />
);

// Medical records
export const MedicalRecordsWidget = ({ count, onClick, loading }) => (
  <MetricWidget
    title="Medical Records"
    value={count}
    subtitle="Patient records"
    icon={AssignmentIcon}
    color="success"
    onClick={onClick}
    loading={loading}
  />
);

// Staff metrics
export const DoctorCountWidget = ({ count, onClick, loading }) => (
  <MetricWidget
    title="Active Doctors"
    value={count}
    subtitle="Available staff"
    icon={LocalHospitalIcon}
    color="info"
    onClick={onClick}
    loading={loading}
  />
);

// System status
export const SystemStatusWidget = ({
  status,
  description,
  color = "success",
}) => (
  <StatusWidget
    title="System Status"
    status={status}
    description={description}
    icon={AssessmentIcon}
    color={color}
  />
);

export const NotificationWidget = ({ count, onClick }) => (
  <StatusWidget
    title="Notifications"
    status={count > 0 ? `${count} new` : "No new notifications"}
    description="System alerts and updates"
    icon={NotificationsIcon}
    color={count > 0 ? "warning" : "success"}
    onClick={onClick}
  />
);

// Quick actions
export const AddPatientWidget = ({ onClick }) => (
  <ActionWidget
    title="Add Patient"
    description="Register a new patient"
    icon={PersonIcon}
    color="primary"
    onClick={onClick}
  />
);

export const ScheduleAppointmentWidget = ({ onClick }) => (
  <ActionWidget
    title="Schedule Appointment"
    description="Book a new appointment"
    icon={EventIcon}
    color="secondary"
    onClick={onClick}
  />
);

export const ViewReportsWidget = ({ onClick }) => (
  <ActionWidget
    title="View Reports"
    description="Analytics and insights"
    icon={AssessmentIcon}
    color="info"
    onClick={onClick}
  />
);
