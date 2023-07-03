import { Alert, Button, Form, FormGroup, Image, Row, Spinner } from 'react-bootstrap';
import { useContext, useRef, useState } from 'react';
import { AuthContext } from 'src/contexts';
// import { fetchApi } from 'src/api/fetch';
// import { apiChangeUsername } from 'src/api/routes';
import { useNavigate } from 'react-router-dom';
import { type IUser } from '@model/user';
import { fetchApi } from 'src/api/fetch';
import { apiChangeImage } from 'src/api/routes';
import { stringFormat } from 'src/utils';
// import { stringFormat } from 'src/utils';

interface ChangeProfilePictureState {
    file: File | null;
    loading: boolean;
    error: string | null;
}
export default function ChangeProfilePicture({ user }: { user: IUser }): JSX.Element {
    const navigate = useNavigate();

    const [authState] = useContext(AuthContext);
    const [state, setState] = useState<ChangeProfilePictureState>({ file: null, loading: false, error: null });

    const hiddenFileInput = useRef<HTMLInputElement>(null);

    const handleSubmit = (): void => {
        if (authState === null) return;
        const formData = new FormData();
        if (state.file !== null) {
            formData.append('file', state.file);
            fetchApi<string>(
                stringFormat(apiChangeImage, [authState.username]),
                {
                    method: 'POST',
                    headers: {}, // so that the browser can set the content type automatically
                    body: formData,
                },
                authState,
                (_) => {
                    navigate(`/user/${authState.username}`);
                },
                (error) => {
                    setState({ ...state, error: error.message });
                },
            );
        }
    };

    function Content(): JSX.Element {
        if (state.loading) {
            return (
                <div className="d-flex justify-content-center">
                    <Spinner className="spinner-form-bs" animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            );
        }
        return (
            <Form className="form-form-bs">
                <FormGroup className="input-form-bs" controlId="NewUsername">
                    <Row className="py-3 m-auto" style={{ maxWidth: '10rem', minWidth: '10rem' }}>
                        <Image
                            src={state.file === null ? user.profile_pic : URL.createObjectURL(state.file)}
                            alt="profile image "
                            style={{ maxWidth: '500px', aspectRatio: '1/1' }}
                            roundedCircle
                            onClick={() => {
                                if (hiddenFileInput !== null) {
                                    if (hiddenFileInput.current !== null) hiddenFileInput.current.click();
                                }
                            }}
                        />
                    </Row>
                    <div className="d-flex justify-content-center flex-column align-items-center">
                        <Button
                            variant="dark"
                            aria-label="Input Media"
                            onClick={() => {
                                if (hiddenFileInput !== null) {
                                    if (hiddenFileInput.current !== null) hiddenFileInput.current.click();
                                } else {
                                    handleSubmit();
                                }
                            }}
                        >
                            <Form.Control
                                tabIndex={-1}
                                aria-hidden="true"
                                className="visually-hidden"
                                title="upload image"
                                type="file"
                                ref={hiddenFileInput}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    if (event.target.files === null || event.target.files.length < 1) return;
                                    const file: File = event.target.files[0] as File;
                                    if (!file.type.startsWith('image/')) {
                                        setState({ ...state, error: 'File must be an image' });
                                        return;
                                    }
                                    setState({ ...state, file: event.target.files[0] ?? null });
                                }}
                            />
                            Change Profile Picture
                        </Button>

                        {state.file !== null && (
                            <Button
                                aria-label="Upload Media"
                                onClick={() => {
                                    handleSubmit();
                                }}
                            >
                                Upload
                            </Button>
                        )}
                    </div>
                </FormGroup>
                {state.error !== null && (
                    <Alert className="alert-form-bs" variant="danger">
                        {state.error}
                    </Alert>
                )}
            </Form>
        );
    }

    return <Content />;
}
