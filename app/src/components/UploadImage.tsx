import { useCallback, useState, useContext } from 'react';
import { fetchApi } from 'src/api/fetch';
import { apiFileUpload } from 'src/api/routes';
import { AuthContext } from 'src/contexts';

function UploadAndDisplayImage(): JSX.Element {
    const [authState] = useContext(AuthContext);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleFileSubmit = useCallback(() => {
        // TODO: handle prevent default and sumbit button
        if (selectedImage == null) {
            console.log('no image');
            return;
        }
        const formData = new FormData();
        formData.append('file', selectedImage);

        console.log(selectedImage);
        fetchApi<any>(
            apiFileUpload,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            },
            authState,
            (data) => {
                console.log(data);
            },
            (error) => {
                console.log(error);
            },
        );
    }, [selectedImage]);

    return (
        <div>
            <h1>Upload and Display Image usign React Hook</h1>

            {selectedImage != null && (
                <div>
                    <img alt="not found" width={'250px'} src={URL.createObjectURL(selectedImage)} />
                    <br />
                    <button
                        onClick={() => {
                            setSelectedImage(null);
                        }}
                    >
                        Remove
                    </button>
                </div>
            )}

            <input
                type="file"
                name="myImage"
                onChange={(event) => {
                    if (event.target.files === null || event.target.files.length < 1) return;
                    console.log(event.target.files[0]);
                    setSelectedImage(event.target.files[0] as File);
                }}
            />
            <button onClick={handleFileSubmit} className="btn btn-primary">
                Upload
            </button>
        </div>
    );
}

export default UploadAndDisplayImage;
