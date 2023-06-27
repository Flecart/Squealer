import { useContext, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import MessageListLoader from 'src/components/MessageListLoader';
import { AuthContext } from 'src/contexts';
import type SearchResult from '@model/search';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { ChannelListLoader } from 'src/components/ChannelList';
import { apiBase } from 'src/api/routes';

export default function Search(): JSX.Element {
    const [searching, setSearching] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [searchError, setSearchError] = useState<string>('');

    const [authState] = useContext(AuthContext);

    function Content(): JSX.Element {
        if (searching) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <Spinner animation="border" role="status" />
                </div>
            );
        }
        if (searchError !== '') {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <Alert variant="danger">{searchError}</Alert>
                </div>
            );
        }

        if (searchResults === null) return <></>;
        if (searchResults.channel.length === 0 && searchResults.messages.length === 0)
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <Alert variant="info">No results found</Alert>
                </div>
            );
        return (
            <>
                {searchResults.channel.length !== 0 && <ChannelListLoader channels={searchResults.channel} />}
                {searchResults.messages.length !== 0 && <MessageListLoader childrens={searchResults.messages} />}
            </>
        );
    }

    function Search(): JSX.Element {
        // facendo questo componente ogni volta che si va a scrivere nel form non si ricarica la pagina
        // però il problma che ogni volta che si fa un submit viene cancellato l'input
        const [search, setSearch] = useState<string>('');
        const handleSearch = (): void => {
            setSearching(true);
            setSearchError('');
            setSearchResults(null);
            const searchParam = new URLSearchParams(`search=${encodeURI(search)}`).toString();
            fetchApi<SearchResult>(
                `${apiBase}/search?${searchParam}`,
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
            <div className="form-outline m-4 d-flex flex-col flex-md-row  ">
                <input
                    className=" form-control h-12 px-4 text-lg text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:shadow-outline"
                    type="text"
                    placeholder="Search..."
                    aria-label="Search Bar"
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />

                <button onClick={handleSearch} className="btn">
                    Search
                </button>
            </div>
        );
    }

    return (
        <SidebarSearchLayout>
            <Search />

            <Content />
        </SidebarSearchLayout>
    );
}
