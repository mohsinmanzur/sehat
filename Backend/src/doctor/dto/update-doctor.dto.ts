import { PartialType } from "@nestjs/mapped-types";
import { CreateDoctorDTO } from "./create-doctor.dto";

export class UpdateDoctorDTO extends PartialType(CreateDoctorDTO) {}