var student = function(){
    var _name  = "bing";
    var _score = 80;

    return {
        getName:function(){
            return _name;
        },
        setName:function(thisName){
            _name = thisName;
        }
    }
}();