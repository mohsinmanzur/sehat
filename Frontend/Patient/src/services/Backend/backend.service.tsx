import { HealthMeasurementDTO, MeasurementUnitDTO } from "../../types/dto";
import * as SecureStore from 'expo-secure-store';
import { PatientDTO } from "../../types/dto";

enum allowedMethods
{
    GET,
    POST,
    PUT,
    DELETE
}

class Backend
{
    private baseUrl: string;
    public jwtToken: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        this.baseUrl = 'https://sehatscan-abgtfbb6cmgmgugr.uaenorth-01.azurewebsites.net';
    }

    // =========================
    // Miscellaneous
    // =========================
    private async readTokensFromStorage()
    {
        const storedJwt = await SecureStore.getItemAsync('jwtToken');
        const storedRefresh = await SecureStore.getItemAsync('refreshToken');

        if (storedJwt && storedRefresh)
        {
            this.jwtToken = storedJwt;
            this.refreshToken = storedRefresh;
        }
    }

    async refreshJWT()
    {
        if (!this.refreshToken) throw new Error('No refresh token available');

        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: allowedMethods[allowedMethods.POST],
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.refreshToken}`,
            }
        });

        if (!response.ok) throw new Error(`Error in refreshing token: ${response.status} ${await response.text()}`);
        
        const data = await response.json();
        this.jwtToken = data.jwt;
        await SecureStore.setItemAsync('jwtToken', data.jwt);
        
        return true;
    }

    private async request(endpoint: string, method: allowedMethods, body?: any, _isRetry = false)
    {
        if (!this.jwtToken || !this.refreshToken)
        {
            await this.readTokensFromStorage();
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.jwtToken) {
            headers['Authorization'] = `Bearer ${this.jwtToken}`;
        }

        const options: RequestInit = {
            method: allowedMethods[method], 
            headers,
        };

        if (body && options.method !== 'GET' && options.method !== 'HEAD') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, options);

        if (response.status === 401 && this.refreshToken && !_isRetry)
        {
            const refreshed = await this.refreshJWT();
            if (refreshed) { 
                return await this.request(endpoint, method, body, true);
            }
        }

        return response;
    }

    // =========================
    // Authentication
    // =========================
    async requestcode(email: string)
    {
        const response = await this.request('/auth/requestcode', allowedMethods.POST, { email });

        if (!response.ok)
        {
            console.log(`Error in requesting code: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        return await response.json();
    }

    async verifycode(email: string, code: string) : Promise<Record<string, any>>
    {
        if (!email || !code) throw new Error('Email and code are required for verification');

        const response = await this.request('/auth/verifycode', allowedMethods.POST, { email, code });
        
        if (response.status === 404) {
            return { needsRegistration: true };
        }

        if (!response.ok) {
            throw new Error(`Error in verifying code: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        const data = await response.json();
        this.jwtToken = data.jwtToken;
        this.refreshToken = data.refreshToken;

        await SecureStore.setItemAsync('jwtToken', data.jwtToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);

        return data;
    }

    async register(patientInfo: PatientDTO)
    {
        const response = await this.request('/auth/register', allowedMethods.POST, patientInfo);
        if (!response.ok) {
            throw new Error(`Error in registering patient: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async logout()
    {
        this.jwtToken = null;
        this.refreshToken = null;
        await SecureStore.deleteItemAsync('jwtToken');
        await SecureStore.deleteItemAsync('refreshToken');
    }

    // =========================
    // Patients
    // =========================
    async getPatients()
    {
        const response = await this.request('/patient', allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patients: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async getPatientById(id: string)
    {
        const response = await this.request(`/patient/?id=${id}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patient: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async getPatientByEmail(email: string)
    {
        const response = await this.request(`/patient/?email=${email}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patient: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }

    async getPatientByName(name: string)
    {
        const response = await this.request(`/patient/?name=${name}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patient: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async createPatient(patientInfo: PatientDTO)
    {
        const response = await this.request('/patient', allowedMethods.POST, patientInfo);
        if (!response.ok) {
            throw new Error(`Error in creating patient: ${response.status} ${await response.text()}`);
        }

        return await response.json();
    }

    // =========================
    // Health Measurements
    // =========================
    async getMeasurementsByPatient(patientId: string)
    {
        const response = await this.request(`/health-measurement/?patient_id=${patientId}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching health measurements: ${response.status} ${await response.text()}`);
        }

        return await response.json();
    }

    async getMeasurementById(id: string)
    {
        const response = await this.request(`/health-measurement/?id=${id}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching health measurement: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async createHealthMeasurement(measurement: HealthMeasurementDTO)
    {
        const response = await this.request('/health-measurement', allowedMethods.POST, measurement);
        if (!response.ok) {
            throw new Error(`Error in creating health measurement: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    async createMeasurementUnit(unit: MeasurementUnitDTO)
    {
        const response = await this.request('/health-measurement/unit', allowedMethods.POST, unit);
        if (!response.ok) {
            throw new Error(`Error in creating measurement unit: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
}

const backend = new Backend();
export default backend;