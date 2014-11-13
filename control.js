/**
 * Created by luzhen on 14-11-13.
 */
var sendControlBuffer={};
var canTyping={};
function sendControl(clientIp,option){
    LIMIT_TIME=option['LIMIT_TIME']!=undefined?option['LIMIT_TIME']:60*1000;
    MAX_SEND_MINUTE=option['MAX_SEND_MINUTE']!=undefined?option['MAX_SEND_MINUTE']:20;
    if(sendControlBuffer[clientIp]===undefined){
        sendControlBuffer[clientIp]={'time':new Date().getTime(),'sendCount':1};
        return true;
    }else{
        var updateTime=sendControlBuffer[clientIp]['time'];
        var now=new Date().getTime();
        if(Number(now)-Number(updateTime)<LIMIT_TIME){
            var sendCount=sendControlBuffer[clientIp]['sendCount'];
            console.log(clientIp+' '+sendCount);
            if(sendCount>MAX_SEND_MINUTE){
                console.log('no broadcast');
                canTyping[clientIp]=false;
                return false;
            }else{
                sendCount++;
                sendControlBuffer[clientIp]['sendCount']=sendCount;
                canTyping[clientIp]=true;
                return true;
            }
        }else{
            delete sendControlBuffer[clientIp];
            canTyping[clientIp]=true;
            return true;
        }
    }
}

function typingControl(clientIp) {
    return canTyping[clientIp]!=false?true:false;
}
exports.sendControl=sendControl;
exports.typingControl=typingControl;