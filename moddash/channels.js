import { channelRoute, moddashDelete, stringFormat, updateRoleRoute } from './routes.js';

/* globals Handlebars */
(function () {
    const CHANNEL_TEMPLATE_ID = 'channel-component-template';
    const CHANNEL_CARD_ID = 'channel-card-template';

    const source = document.getElementById(CHANNEL_TEMPLATE_ID).innerHTML;
    const template = Handlebars.compile(source);
    const context = { first: true, loading: false, channels: null, error: null };

    const html = template(context);
    document.getElementById('main-content').innerHTML = html;

    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');

    const loadChannels = () => {
        const context = { first: false, loading: true, channels: null, error: null };
        const html = template(context);
        document.getElementById('main-content').innerHTML = html;

        const params = new URLSearchParams({
            name: document.getElementById('search-channel').value,
            sortby: document.getElementById('sortby-channel').value,
            limit: document.getElementById('limit-channel').value,
        });
        fetch(`${channelRoute}?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + authState.token,
            },
        })
            .then(async (channels) => {
                const newContext = { ...context, loading: false };

                if (channels.status === 200) {
                    newContext.channels = await channels.json();
                } else {
                    newContext.error = await channels.json().message;
                }
                const html = template(newContext);
                document.getElementById('main-content').innerHTML = html;
            })
            .catch((e) => {
                const newContext = { ...context, loading: false, error: e.message };
                const html = template(newContext);
                document.getElementById('main-content').innerHTML = html;
            });
    };

    document.getElementById('filter-channel').onclick = loadChannels;
    const channelCardSource = document.getElementById(CHANNEL_CARD_ID).innerHTML;
    const channelCardTemplate = Handlebars.compile(channelCardSource);

    Handlebars.registerPartial('channel-card', (a) => {
        return channelCardTemplate(a);
    });
})();

export function updateRole(id, user) {
    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');
    const role = document.getElementById(`privilege-${id}-${user}`).value;
    fetch(stringFormat(updateRoleRoute, [id, user]), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authState.token,
        },
        body: JSON.stringify({ role }),
    })
        .then((res) => {
            window.location.reload();
        })
        .catch((e) => {
            window.location.reload();
        });
}

export function deleteChannel(name) {
    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');
    fetch(stringFormat(moddashDelete, [name]), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authState.token,
        },
    })
        .then(() => {
            window.location.reload();
        })
        .catch((e) => {
            window.location.reload();
        });
}
