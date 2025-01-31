<?php include("control/path.php"); 
    include("control/users.php");
    $i = (int)$_GET['i'];
    $t = (int)$_GET['t'];
    // userinvite($t, $i);
    array_push($_SESSION['user'][$t]['invite'], $i);
    $Err=0;
    $_SESSION['user'][$i]['party']=$t;
    // $_SESSION['user'][$t]['part']=$i;
    //$_SESSION['user'][$i]['part']=$t;
?>  
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Refresh" content="10">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/room.css">
    <title>Room</title>
</head>
<body>
    <div class="centr-form">
        <?php if(isset($_SESSION['user'][$t]['party'][$i])): ?>
            <div class="link">
                <div class="Image"></div>
                <div class="greenfn"></div>
                <div class="left-form">
                    <div class="form-group">
                        <label for="name" class="form-label">Имя  </label>
                        <span id="TextName" class="form-value"><?php echo htmlspecialchars($_SESSION['user'][$t]['name']); ?></span>
                    </div>
                    <?php if($_SESSION['user'][$t]['LightMail']==1): ?>
                        <div class="form-group">
                            <label for="email" class="form-label">Электронная почта  </label>
                            <span id="TextEmail" class="form-value"><?php echo htmlspecialchars($_SESSION['user'][$t]['mail']); ?></span>
                        </div>
                    <?php endif ?>
                    <div class="form-group">
                        <label for="W/L" class="form-label">Побед / Поражений  </label>
                        <spa id="TextWL" class="form-value"><?php echo(htmlspecialchars($_SESSION['user'][$t]['wins'])." / ". htmlspecialchars($_SESSION['user'][$t]['lose'])); ?></span>
                    </div>
                </div>
            </div>
        <?php else: ?>
            <span id="TextInvite" class="form-value"><?php echo ("Ожидание игрока " . htmlspecialchars($_SESSION['user'][$t]['name']) . "...") ?></span>
        <?php endif ?>
    <div class="container">
        <div class="header">
            <div class="setting">
                <a href="<?php echo BASE_URL . "/listpip.php" . '?i=' . $i; ?>" class="href" >Назад</a>
            </div>
            
        </div>
        <?php if(isset($_SESSION['user'][$t]['party'][$i]) && !isset($_SESSION['user'][$t]['invite'][$i])): ?>
            <?php echo ("Игрок " . htmlspecialchars($_SESSION['user'][$t]['name']) . " Не подключился") ?>
        <!-- <div class="buttoncl">
            <a href="<?php echo BASE_URL . ""; ?>" class="settings-button" >Прочесть правила</a>
        </div> -->
        <?php endif ?>
    </div>
    <div class="link">
        <div class="Image"></div>
        <div class="greenfn"></div>
        <div class="left-form">
            <div class="form-group">
                <label for="name" class="form-label">Имя  </label>
                <span id="TextName" class="form-value"><?php echo htmlspecialchars($_SESSION['user'][$i]['name']); ?></span>
            </div>
            <?php if($_SESSION['user'][$t]['LightMail']==1): ?>
                <div class="form-group">
                    <label for="email" class="form-label">Электронная почта  </label>
                    <span id="TextEmail" class="form-value"><?php echo htmlspecialchars($_SESSION['user'][$i]['mail']); ?></span>
                </div>
            <?php endif ?>
            <div class="form-group">
                <label for="W/L" class="form-label">Побед / Поражений  </label>
                <spa id="TextWL" class="form-value"><?php echo(htmlspecialchars($_SESSION['user'][$i]['wins'])." / ". htmlspecialchars($_SESSION['user'][$i]['lose'])); ?></span>
            </div>
        </div>
    </div>
</div>
</body>
</html>