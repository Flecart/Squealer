import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as userAction from '@flux/actions/user';

export function User() {
    const dispatch = useDispatch();
    //  useEffect(()=>{
    //    dispatch(userAction.fetchUser());
    // },[dispatch]);
    //const userAll=useSelector(userSelector.getUser());
    return <div></div>;
}
