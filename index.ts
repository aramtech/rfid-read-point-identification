const generatePartialUUID = () => Math.random().toString(36).substring(2);
const generateUUID = () => {
    const g = generatePartialUUID;
    return g() + g() + g() + g() + g();
};

export type ReaderIdentificationInput = {
    name: string;
    description?: string | null;
    positioningLatitude?: number | null;
    positioningLongitude?: number | null;
    placementDescription?: string | null;
    manufacturer: string;
    model: string;
    serialNumber?: string | null;
};

export type ReaderIdentification = ReaderIdentificationInput & {
    networkInfo: NetworkInterfacesMap;
    uuid: string;
};

export type NetworkInterfacesMap = {
    interfaceName: string; 
    ipAddress: string; 
    macAddress: string;
}[]

export type IdentifyProps = {
    getFromStorage: () => Promise<ReaderIdentification | null> | (null | ReaderIdentification);
    saveInStorage: (identification: ReaderIdentification) => Promise<void> | void;
    defaultIdentification: ReaderIdentificationInput;
    getNetworkInfo: () => Promise<NetworkInterfacesMap> | NetworkInterfacesMap;
};

export const identifyReader = (props: IdentifyProps) => {
    const getOrSetDefaultIdentificationInfo = async () => {
        const savedIdentification = await props.getFromStorage();
        let IdentificationInfo: ReaderIdentification;
        if (!savedIdentification) {
            const NewIdentificationInfo: ReaderIdentification = {
                ...props.defaultIdentification,
                uuid: generateUUID(),
                networkInfo: await props.getNetworkInfo(),
            };
            props.saveInStorage(NewIdentificationInfo);
            IdentificationInfo = NewIdentificationInfo;
        } else {
            IdentificationInfo = { ...savedIdentification, networkInfo: await props.getNetworkInfo() };
        }
        return IdentificationInfo;
    };
    const getCurrentIdentificationInfo = async () => {        
        return await getOrSetDefaultIdentificationInfo()
    };

    const updateIdentificationInfo = async (updatedInfo: Partial<ReaderIdentificationInput>)=>{
        const current = await getCurrentIdentificationInfo(); 
        await props.saveInStorage({
            ...current, 
            ...updatedInfo, 
        })
    }

    return {
        getCurrentIdentificationInfo,
        updateIdentificationInfo
    }
};
