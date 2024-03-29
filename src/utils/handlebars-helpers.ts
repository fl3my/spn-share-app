import moment from "moment";
import { DonationStatus, RequestStatus } from "../models/enums";

export const eq = function (v1: string, v2: string): boolean {
  return v1 === v2;
};

export const formatDate = function (date: Date, format: string) {
  return moment(date).format(format);
};

export const or = function (v1: boolean, v2: boolean): boolean {
  return v1 || v2;
};

export const donationStatusColour = function (status: DonationStatus) {
  switch (status) {
    case DonationStatus.AVAILABLE:
      return "text-bg-info";
    case DonationStatus.CLAIMED:
      return "text-bg-warning";
    case DonationStatus.COMPLETED:
      return "text-bg-success";
    default:
      return "";
  }
};

export const requestStatusColour = function (status: RequestStatus) {
  switch (status) {
    case RequestStatus.PENDING:
      return "text-bg-info";
    case RequestStatus.ACCEPTED:
      return "text-bg-warning";
    case RequestStatus.REJECTED:
      return "text-bg-danger";
    case RequestStatus.COMPLETED:
      return "text-bg-success";
    default:
      return "";
  }
};
