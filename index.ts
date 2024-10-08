const generatePartialUUID = () => Math.random().toString(36).substring(2);
const generateUUID = () => {
    const g = generatePartialUUID;
    return g() + g() + g() + g() + g();
};

type ReaderIdentificationInput = {
    name: string;
    description?: string | null;
    positioningLatitude?: number | null;
    positioningLongitude?: number | null;
    placementDescription?: string | null;
    manufacturer: string;
    model: string;
    serialNumber?: string | null;
};

type ReaderIdentification = ReaderIdentificationInput & {
    localIpAddress?: string | null;
    uuid: string;
};

type IdentifyProps = {
    getFromStorage: () => Promise<ReaderIdentification | null> | (null | ReaderIdentification);
    saveInStorage: (identification: ReaderIdentification) => Promise<void> | void;
    defaultIdentification: ReaderIdentificationInput;
    getLocalIpAddress: () => Promise<string | null | undefined>;
};

export const identifyReader = async (props: IdentifyProps) => {
    const getOrSetDefaultIdentificationInfo = async () => {
        const savedIdentification = await props.getFromStorage();
        let IdentificationInfo: ReaderIdentification;
        if (!savedIdentification) {
            const NewIdentificationInfo: ReaderIdentification = {
                ...props.defaultIdentification,
                uuid: generateUUID(),
                localIpAddress: await props.getLocalIpAddress(),
            };
            props.saveInStorage(NewIdentificationInfo);
            IdentificationInfo = NewIdentificationInfo;
        } else {
            IdentificationInfo = { ...savedIdentification, localIpAddress: await props.getLocalIpAddress() };
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
