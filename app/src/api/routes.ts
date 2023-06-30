export const squealerBaseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';

export const apiBase = `${squealerBaseUrl}/api`;
export const apiSearch = `${apiBase}/search`;

export const apiUserBase = `${apiBase}/user`;
export const apiUser = `${apiUserBase}/{0}`;
export const apiUserRole = `${apiUserBase}/role`;
export const apiDelete = `${apiBase}/user/delete`;
export const apiUserNotification = `${apiBase}/user/notification`;
export const apiUserInvitations = `${apiUserBase}/invitations`;
export const apiUserPayDebt = `${apiUserBase}/pay-debt`;
export const apiUserNotifications = `${apiUserBase}/notifications`;
export const apiUserSetNotification = `${apiUserBase}/notification/{0}`;

export const apiQuotaBase = `${apiBase}/user/quota`;
export const apiQuota = `${apiQuotaBase}/buy`;

export const apiLogin = `${apiBase}/auth/login`;
export const apiAuthUserBase = `${apiBase}/auth/user`;
export const apiCreate = `${apiBase}/auth/create`;
export const apiSettingReset = `${apiBase}/auth/setting-reset`;
export const apiResetPassword = `${apiBase}/auth/reset-password`;
export const apiChangePassword = `${apiAuthUserBase}/{0}/change-password`;
export const apiChangeUsername = `${apiAuthUserBase}/{0}/change-username`;

export const apiMessageBase = `${apiBase}/message`;
export const apiFeedBase = `${apiBase}/feed`;
export const apiMessageReaction = `${apiMessageBase}/{0}/reaction`;
export const apiMessageParent = `${apiMessageBase}/{0}`;

export const apiChannelBase = `${apiBase}/channel`;
export const apiChannels = `${apiChannelBase}/channels`;
export const apiChannelAddOwner = `${apiChannelBase}/{0}/add-owner`;
export const apiChannelSetPermission = `${apiChannelBase}/{0}/set-permission`;
export const apiChannelAccept = `${apiChannelBase}/accept`;
export const apiChannelDecline = `${apiChannelBase}/decline`;
export const apiChannelGet = `${apiChannelBase}/{0}`;
export const apiChannelNotify = `${apiChannelBase}/{0}/notify`;
export const apiChannelJoin = `${apiChannelBase}/{0}/join`;
export const apiChannelLeave = `${apiChannelBase}/{0}/leave`;
export const apiChannelCreate = `${apiChannelBase}/create`;
export const apiBuyChannel = `${apiChannelBase}/create`;

export const apiTemporized = `${apiBase}/temporizzati`;

export const imageBase = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
export const apiFileUpload = `${apiBase}/file/upload`;
