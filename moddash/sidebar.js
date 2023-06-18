(function () {
    const USER_SIDEBAR_ID = 'user-sidebar-template';

    const source = document.getElementById(USER_SIDEBAR_ID).innerHTML;
    const template = Handlebars.compile(source);
    const context = { name: 'Loading', img: '' };
    const html = template(context);
    document.getElementById('user-sidebar').innerHTML = html;

    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');

    if (authState == null) {
        window.location.replace(`/login?redirect=${encodeURIComponent(window.location)}`);
    }

    fetch(`/api/user/${authState.username}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authState.token,
        },
    }).then(async (response) => {
        const jsonResponse = await response.json();
        context.name = jsonResponse.username;
        context.img = jsonResponse.profile_pic;
        document.getElementById('user-sidebar').innerHTML = template(context);
        if (jsonResponse.role !== 'moderator') {
            window.location.replace('/logout');
        }
    });
})();
