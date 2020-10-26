var AntGameTestScene = TestScene.extend({
    runThisTest:function () {
        this.addChild(new AntGamePlay());
        director.runScene(this);
    }
});

var Ants = [];
var SpeedBoxs = [];
var label;

var AntGamePlay = cc.Layer.extend({
    ctor: function () {
        if (window.sideIndexBar) {
            window.sideIndexBar.changeTest(0, 4);
        }
        this._super();
        this.init();
        var s = director.getWinSize();

        var layer = new cc.LayerColor(cc.color(255, 255, 0, 100));
        this.addChild(layer, -1);
        this.scheduleUpdate();

        label = new cc.LabelTTF("Ant Game", "Arial", 20);
        this.addChild(label, 0, 25);
        label.x = s.width / 3;
        label.y = s.height - 50;
        label.setString("new string");

        if ('touches' in cc.sys.capabilities)
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchesEnded: function (touches, event) {
                    if (touches.length <= 0)
                        return;
                    event.getCurrentTarget().clickSprite(touches[0].getLocation());
                }
            }), this);
        else if ('mouse' in cc.sys.capabilities)
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseUp: function (event) {
                    event.getCurrentTarget().clickSprite(event.getLocation());
                }
            }, this);

        this.initSprite(3);
        this.initSpeedBox(4)

    },

    initSprite: function(num){
        if (num<3) num = 3;
        var s = director.getWinSize();

        for (var i=0; i<num; i++){
            Ants.push(new cc.Sprite(s_pathGrossini));
            Ants[i].velocity = 50;
            Ants[i].isCollision = false;
            this.addChild(Ants[i], 0, i);
            Ants[i].x = Math.floor(Math.random() * (s.width/3)) + s.width/3;
            Ants[i].y = Math.floor(Math.random() * (s.height/3)) + s.height/3;
            this.setSpriteDirection(i);
        }
    },

    initSpeedBox: function(num){
        var s = director.getWinSize();
        for (var i=0; i<num; i++){
            SpeedBoxs.push(new cc.Sprite(s_image_icon));
            this.addChild(SpeedBoxs[i]);
            SpeedBoxs[i].x = Math.floor(Math.random() * 4)* s.width/5 + s.width/5;
            SpeedBoxs[i].y = Math.floor(Math.random() * 4)* s.height/5 + s.height/5;
        }
    },

    setSpriteDirection: function (sprite_id){
        var sprite = Ants[sprite_id];

        var direction = Math.floor(Math.random() * (4 - 0)) + 0;
        while (direction === sprite.direction)
            direction = Math.floor(Math.random() * (4 - 0)) + 0;
        sprite.direction = direction;

        var s = director.getWinSize();
        sprite.xtarget = Math.floor(Math.random() * s.width / 3) +  s.width / 3;
        sprite.ytarget =Math.floor(Math.random() * s.height / 3) + s.height / 3;
        switch (direction) {
            case 0: //top
                sprite.ytarget = s.height;
                break;
            case 1: //right
                sprite.xtarget = s.width;
                break;
            case 2: //bottom
                sprite.ytarget = 0;
                break;
            case 3: //left
                sprite.xtarget = 0;
                break;
        }

        this.moveSprite(sprite);
    },

    moveSprite: function(sprite){
        sprite.stopAllActions();

        var dis = Math.sqrt((sprite.xtarget - sprite.x) * (sprite.xtarget - sprite.x) + (sprite.ytarget - sprite.y) * (sprite.ytarget - sprite.y));
        var t = dis / sprite.velocity;
        var mt = cc.MoveTo(t, cc.p(sprite.xtarget, sprite.ytarget));
        var fu = new cc.CallFunc(function() {
                var id = -1;
                for (var j=0; j<Ants.length; j++)
                    if (sprite == Ants[j]){
                        id =j;
                        break;
                    }
                sprite.removeFromParent();
                Ants.splice(id, 1);
            }
        );
        sprite.runAction(cc.Sequence(mt, fu));

        var o = sprite.xtarget - sprite.x;
        var a = sprite.ytarget - sprite.y;
        if (a==0){
            sprite.ytarget+=1;
            a = 1;
        }
        var at = Math.atan(o / a) * 57.29577951;  // radians to degrees

        if (a < 0) {
            if (o < 0)
                at = 180 + Math.abs(at);
            else
                at = 180 - Math.abs(at);
        }
        var rt = cc.rotateTo(0.5, at);
        sprite.runAction(rt);
    },

    changeDirection: function(sprite){
        var s = director.getWinSize();
        switch (sprite.direction) {
            case 0: //top
                sprite.direction = 2; //to bottom
                sprite.ytarget = 0;
                break;
            case 1: //right
                sprite.direction = 3; //to left
                sprite.xtarget = 0;
                break;
            case 2: //bottom
                sprite.direction = 0; //to top
                sprite.ytarget = s.height;
                break;
            case 3: //left
                sprite.direction = 1; //to right
                sprite.xtarget = s.width;
                break;
        }

        switch (sprite.direction) {
            case 0: //top
            case 2: //bottom
                if (sprite.xtarget > s.width / 2)
                    sprite.xtarget -= 5;
                else sprite.xtarget += 5;
                break;
            case 1: //right
            case 3: //left
                if (sprite.ytarget > s.height / 2)
                    sprite.ytarget -= 5;
                else sprite.ytarget += 5;
                break;
        }

        this.moveSprite(sprite);
    },

    update: function(){
        for (var j=0; j<Ants.length; j++){
            var f = false;
            var abox = Ants[j].getBoundingBox();
            for (var i=0; i<SpeedBoxs.length; i++){
                var sbox = SpeedBoxs[i].getBoundingBox();
                if (cc.rectIntersectsRect(sbox, abox)) {
                    f = true;
                    if (Ants[j].isCollision == false) {
                        Ants[j].isCollision = true;
                        this.changeDirection(Ants[j]);
                    }
                    break;
                }
            }
            if (!f && Ants[j].isCollision)
                Ants[j].isCollision = false;
        }
    },

    clickSprite: function (position) {
        for (var i=0;i<Ants.length;i++){
            var box = Ants[i].getBoundingBox();
            if (cc.rectContainsPoint(box, position)){
                if (Ants[i].velocity < 250)
                    Ants[i].velocity += 10;
                this.setSpriteDirection(i);
                break;
            }
        }
    },

});
