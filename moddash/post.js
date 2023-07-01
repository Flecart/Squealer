/* globals Handlebars */

import { moddashPosts, postCopyRoute, postReactionRoute, stringFormat, postWithIdRoute } from './routes.js';

const global = {
    context: {
        loading: false,
        posts: null,
        error: null,
    },
    template: null,
};

(function () {
    const POST_PAGE_ID = 'post-page-template';
    const POST_COMPONENT_ID = 'post-component-template';

    const source = document.getElementById(POST_PAGE_ID).innerHTML;
    global.template = Handlebars.compile(source);

    const html = global.template({ ...global.context, firstTime: true });
    document.getElementById('main-content').innerHTML = html;

    const sourceComponent = document.getElementById(POST_COMPONENT_ID).innerHTML;
    const templateComponent = Handlebars.compile(sourceComponent);

    Handlebars.registerPartial('post-component', function (post) {
        post[post.content.type] = true;
        post.date = new Date(post.date).toLocaleDateString();
        const reactionTypes = new Map([
            [-2, 'angry'],
            [-1, 'dislike'],
            [1, 'like'],
            [2, 'love'],
        ]);

        if (post.content.type === 'maps') {
            post.lastPos = JSON.stringify(post.content.data.positions[post.content.data.positions.length - 1]);
            post.content.data = JSON.stringify(post.content.data.positions);
        }
        for (const [key, value] of reactionTypes) {
            post[value] = post.reaction.filter((reaction) => reaction.type === key).length;
        }
        return templateComponent(post);
    });
    document.getElementById('filter-user').onclick = getPosts;
})();

function getPosts() {
    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');
    const filter = {};
    const author = document.getElementById('author').value;
    if (author) {
        filter.username = author;
    }
    const from = document.getElementById('from-date').value;
    if (from) {
        filter.from = from;
    }
    const to = document.getElementById('to-date').value;
    if (to) {
        filter.to = to;
    }
    const channel = document.getElementById('channel').value;
    if (channel) {
        filter.channel = channel;
    }
    const type = document.getElementById('message-type').value;
    if (type && type !== 'all') {
        filter.type = type;
    }
    const limit = document.getElementById('limit').value;
    if (limit) {
        filter.limit = limit;
    }

    if (!global.context.loading) {
        global.context.loading = true;
        global.context.error = null;
        global.context.posts = null;
        const context = global.context;
        fetch(moddashPosts, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + authState.token,
            },
            body: JSON.stringify(filter),
        })
            .then(async (response) => {
                const jsonResponse = await response.json();
                context.loading = false;
                if (response.status === 200) {
                    context.posts = jsonResponse;
                    document.getElementById('main-content').innerHTML = global.template(context);
                } else {
                    context.error = jsonResponse;
                    document.getElementById('main-content').innerHTML = global.template(context);
                }
            })
            .catch((error) => {
                context.error = error;
                context.loading = false;
                document.getElementById('main-content').innerHTML = global.template(context);
            });
    }
}

/**
 *
 * @param {string} postId
 */
export function copyToChannel(postId) {
    const copyToChannel = document.getElementById(`copy-channel-${postId}`).value;
    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');
    fetch(stringFormat(postCopyRoute, [postId]), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authState.token,
        },
        body: JSON.stringify({ channel: copyToChannel }),
    }).then(() => {
        window.location.reload();
    });
}

/**
 *
 * @param {string} postId
 */
export function changeReaction(postId) {
    const reactions = ['angry', 'dislike', 'like', 'love'];
    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');
    const body = {};
    for (const index in reactions) {
        body[reactions[index]] = document.getElementById(`${reactions[index]}-${postId}`).value;
    }
    fetch(stringFormat(postReactionRoute, [postId]), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authState.token,
        },
        body: JSON.stringify(body),
    });
}

/**
 *
 * @param {string} postId
 */
export function deletePost(postId) {
    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');
    fetch(stringFormat(postWithIdRoute, [postId]), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authState.token,
        },
    }).then(() => {
        window.location.reload();
    });
}
