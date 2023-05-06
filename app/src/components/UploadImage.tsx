import { useCallback, useState, useContext } from 'react';
import { fetchApi } from 'src/api/fetch';
import { apiFileUpload } from 'src/api/routes';
import { AuthContext } from 'src/contexts';

function UploadAndDisplayImage(): JSX.Element {
    const [authState] = useContext(AuthContext);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleFileSubmit = useCallback(() => {
        // TODO: handle prevent default and submit button
        if (selectedImage == null) {
            return;
        }
        const formData = new FormData();
        formData.append('file', selectedImage);

        console.log(selectedImage);
        fetchApi<any>(
            apiFileUpload,
            {
                method: 'POST',
                headers: {}, // so that the browser can set the content type automatically
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
        <>
            {selectedImage != null && (
                <div>
                    <img alt="uploaded image" width={'250px'} src={URL.createObjectURL(selectedImage)} />
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

            {/* TODO: use correct bootsrap components and fix accessibiility of this */}
            <input
                type="file"
                name="image "
                onChange={(event) => {
                    if (event.target.files === null || event.target.files.length < 1) return;
                    setSelectedImage(event.target.files[0] as File);
                }}
            />
            <button onClick={handleFileSubmit} className="btn btn-primary">
                Upload
            </button>
        </>
    );
}

export default UploadAndDisplayImage;
