module.exports.validateRegisterInput = (
   username,
   email,
   password,
   confirmPassword 
) => {
    const errors = {}
    if(username.trim() === ''){
        errors.username = ' Username must not be empty';
    }
    if(email.trim() === ''){
        errors.email = 'Email Must not be empty';
    }else{
        const regEx = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(!email.match(regEx)){
            errors.email = 'Email must be a valid email address';
        }
    }
    if(password === ''){
        errors.password = 'Password must not empty';
    }else if( password !== confirmPassword){
        errors.confirmPassword = 'Password must match';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
}

module.exports.validateLoginInput = ( username,password) =>{
    const errors = {};
    if(username.trim() === ''){
        errors.username = 'Username must not be empty';
    }
    if(password.trim() === ''){
        errors.password = 'password must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
}