<?php
include("DataBase/database.php");
include("control/path.php");
$errMsg ='';
$name = '';
$mail = '';
$id=0;
$visible = 0;
if (!isset($_SESSION['user'])) {
    $_SESSION['user'] = []; // Инициализируем массив
}
// $_SESSION['id']=[];
// $_SESSION['ID']=[];
// $_SESSION['name']=[];
// $_SESSION['mail']=[];
// $_SESSION['wins']=[];
// $_SESSION['lose']=[];
// $_SESSION['password']=[];
// $_SESSION['LightMail']=[];
if($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['button-reg'])){
    $name = trim($_POST['name']);
    $mail = trim($_POST['mail']);
    $password1 = trim($_POST['pass-first']);
    $password2 = trim($_POST['pass-second']);
    //$password = password_hash($_POST['pass-second'], PASSWORD_DEFAULT);
    if($name==='' || $mail==='' || $password1===''){
        $errMsg="Не все поля заполнены";
    } elseif ($password1 !== $password2) {
        $errMsg = "Пароли не совпадают";
    }elseif(mb_strlen($name,'UTF8') < 3){
        $errMsg = "Логин должен быть более 3-х символов";
    }else{
        $existence = selectOne('users', ['mail' => $mail]);   
        if($existence && isset($existence['mail']) && $existence['mail'] === $mail){
            $errMsg = "Пользователь с такой почтой уже существует";
        } else{
            $post = [
                'name'=> $name,
                'password'=> password_hash($password1, PASSWORD_DEFAULT),
                'mail'=> $mail
            ];
            $id = insert('users', $post);
            $errMsg ="Пользователь "."<strong>". $name. "</strong>" ." успешно зарегистрирован!";
            $user = selectOne('users',['ID'=>$id]);
            ses($user);
        }
    }
    // $last_row = selectOne('users',['ID'=> $id]);
} 
if($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['button-sign'])){
    $mail = trim($_POST['mail']);
    $password = trim($_POST['password']);
    if($mail==='' || $password===''){
        $errMsg="Не все поля заполнены";
    } else{
        $existence = selectOne('users', ['mail' => $mail]); 
        if($existence && password_verify($password, $existence['password'])){
            ses($existence);
        }else{
            $errMsg = "Почта или пароль введены неверно!";
        }
    }
}
if($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['button-save'])){
    $mail = trim($_POST['mail']);
    $name = trim($_POST['name']);
    $password = trim($_POST['password']);
    $password1 = trim($_POST['pass-first']);
    $password2 = trim($_POST['pass-second']);
    if($_POST['mailVisible']){$visible = 1;} else{$visible = 0;}
    if($mail==='' || $name===''){
        $errMsg="Не все поля заполнены";
    } elseif(mb_strlen($name,'UTF8') < 3){
        $errMsg = "Логин должен быть более 3-х символов";
    } else{
        //$existence = selectOne('users', ['ID' => $_SESSION['ID']]); 
        if ($password1!=='' || $password2!==''){
            if( password_verify($password, $_SESSION['password'])){
                if($password1===$password2){
                    updateuser($name, $mail, $visible, $password1);
                }else{
                    $errMsg = "Пароли не совпадают";
                }
            }else{
                $errMsg = "Пароль введён неверно";
            }
        }else{
            updateuser($name, $mail, $visible, '1');
            // $errMsg = "Заполните все поля для сохранения!";
        }
    }
}
function updateuser($name, $mail, $visible, $pass){
    $find_mail = selectOne('users', ['mail' => $mail]); 
    // if($existence['mail'] === $mail){
    // } 
    $id = $_POST['user_index'];
    if($find_mail && $find_mail['ID']!==$_SESSION['user'][$id]['ID']){
        $errMsg = "Пользователь с этой почтой уже зарегистрирован!";
        exit;
    }elseif($pass!='1'){
        $post = [
            'name'=> $name,
            'mail'=> $mail,
            'password'=> password_hash($pass, PASSWORD_DEFAULT),
            'LightMail' => $visible,
            'Online'=>1
        ];
    }else{
        $post = [
            'name'=> $name,
            'mail'=> $mail,
            //'password'=> password_hash($pass, PASSWORD_DEFAULT),
            'LightMail' => $visible,
            'Online'=>1
        ];
    }
    update('users', $_SESSION['user'][$id]['ID'] ,$post);
    $existence = selectOne('users', ['mail' => $mail]); 
    unset($_SESSION['user'][$id]);
    ses($existence);
    //header('location: ' . BASE_URL);
}
function ses($user){
    for($i=1; $i<100; $i++){
        if (!isset($_SESSION['user'][$i])){
            $_SESSION['user'][$i] = [
                'ID' => $user['ID'],
                'name' => $user['name'],
                'mail' => $user['mail'],
                'wins' => $user['wins'],
                'lose' => $user['lose'],
                'password' => $user['password'],
                'LightMail' => $user['LightMail'],
                'Online' => 1,
                'party' => 0,
                'invite' => []
            ];
            $post = [
                'Online'=>1
            ];
            update('users', $_SESSION['user'][$i]['ID'] ,$post);
            break;
        }
        // else{
             //unset($_SESSION['user'][$i]);
        // }
    }
    header('location: '. BASE_URL . '?i=' . $i);
}
// function userinvite($t, $i){
    // foreach($_SESSION['user'] as $q => $qwe){
        //if(!isset($qwe['invite'])){
    //     if($q['ID'] == $t){     
        // }
        //}   
    // }
// }
if($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['button_delinvite'])){
    $t = (int)$_POST['invite_index'];
    $i = (int)$_POST['id_index'];
    unset($_SESSION['user'][$i]['invite'][$t]);
}
function delinvite($i){
    foreach($_SESSION['user'] as $q => $qwe){
        if (isset($qwe['invite']) && isset($qwe['invite'][$i])){
            unset($_SESSION['user'][$q]['invite'][$i]);
        }
    }
}
?>