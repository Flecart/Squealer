import { useContext, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import MessageListLoader from 'src/components/MessageListLoader';
import { AuthContext } from 'src/contexts';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function Search(): JSX.Element {
    const [search, setSearch] = useState<string>('');
    const [searching, setSearching] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchError, setSearchError] = useState<string>('');

    const [authState] = useContext(AuthContext);

    const handleSearch = (): void => {
        console.log(search);
        setSearching(true);
        setSearchError('');
        setSearchResults([]);
        fetchApi<string[]>(
            `/search/${search}`,
            { method: 'GET' },
            authState,
            (results) => {
                setSearchResults(results);
                setSearching(false);
            },
            (error) => {
                setSearchError(error.message);
                setSearching(false);
            },
        );
    };

    return (
        <SidebarSearchLayout>
            <div className="form-outline m-4">
                <input
                    className="w-full form-control h-12 px-4 text-lg text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:shadow-outline"
                    type="text"
                    placeholder="Search..."
                    aria-label="Search Bar"
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />

                <button onClick={handleSearch} className="button">
                    {' '}
                    Search{' '}
                </button>
            </div>
            <div className="flex flex-row items-center justify-center h-full"></div>

            {searching ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <Spinner animation="border" role="status" />
                </div>
            ) : (
                <>
                    {searchError !== '' ? (
                        <Alert variant="danger">{searchError}</Alert>
                    ) : (
                        <MessageListLoader childrens={searchResults} />
                    )}
                </>
            )}
        </SidebarSearchLayout>
    );
}
