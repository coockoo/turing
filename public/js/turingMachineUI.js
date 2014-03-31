function TuringMachineUI (controller) {
    this.controller = controller;
    this.rules = [];

    this.$rules = $('.rules');
    this.$tape = $('.tape');
    this.$loads = $('.loads');
    this.$saveForm = $('.save-form');
    this.tapeEl = [];
    this.runTimer = null;
}
TuringMachineUI.prototype.load = function (callback) {
    var self = this;
    $.get('/templates/rule.html', function (data) {
        this.registerHandlers();
        this.displayTape();
        this.setValidators();
        $(function() {
            $('.rules').sortable({
                axis: 'y',
                start: function(e, ui){
                    ui.placeholder.height(ui.item.height());
                }
            }).disableSelection();
        });
        this.ruleTemplate = data;
        $.get('/templates/load.html', function (data) {
            this.loadTemplate = data;
            self.controller.loadAll(function (data) {
                self.$loads.html("");
                for (var i = 0; i < data.length; ++i) {
                    self.addLoad(data[i]);
                }
            });
            callback && callback(this)
        }.bind(this));
    }.bind(this));
};
TuringMachineUI.prototype.clearForm = function () {
    var $form = $('.new-rule-form');
    $form.find('input[type="text"]').each(function () {
        var $this = $(this);
        $this.val("");
        $this.parent().find('label').removeClass('correct').addClass('incorrect');
    });
    $form.find('input[type="submit"]').attr('disabled', 'disabled');
};
TuringMachineUI.prototype.addRule = function (rule) {
    var html = this.ruleTemplate;
    var self = this;
    this.controller.addRule(rule, function (newRule) {
        for (var key in newRule) {
            if (newRule.hasOwnProperty(key)) {
                var re = new RegExp('%' + key + '%', 'g');
                html = html.replace(re , newRule[key]);
            }
        }
    });
    var $rule = $(html);
    $rule.on('click', '.state', function () {
        self.setState($(this).parent().data('state'));
    });
    this.$rules.append($rule.hide());
    $rule.slideDown();
    this.clearForm();
};
TuringMachineUI.prototype.setValidators = function () {
    var $form = $('.new-rule-form'),
        $submit = $form.find('input[type="submit"]'),
        $state = $form.find('#state'),
        $cell = $form.find('#cell'),
        $replace = $form.find('#replace'),
        $next = $form.find('#next');

    function handler (el) {
        if (el.val() != "") {
            el.parent().find('label').removeClass('incorrect').addClass('correct');
            if ($('.incorrect').length == 0) {
                $submit.removeAttr('disabled');
            }
        } else {
            el.parent().find('label').removeClass('correct').addClass('incorrect');
            $submit.attr('disabled', 'disabled');
        }
    }
    $state.keyup(function () {
        var $this = $(this);
        handler($this);
    });
    $cell.keyup(function () {
        var $this = $(this);
        handler($this);
    });
    $replace.keyup(function () {
        var $this = $(this);
        handler($this);
    });
    $next.keyup(function () {
        var $this = $(this);
        handler($this);
    });
};
TuringMachineUI.prototype.displayTape = function () {
    var self = this;
    this.$tape.html("");
    var tapeString = this.controller.getTape();
    for (var i = 0; i < tapeString.length; ++i) {
        var $el = $(
            '<span class="border %class%" data-index="%index%">%data%</span>'
                .replace('%data%', tapeString[i])
                .replace('%class%', (this.controller.getTapeIndex() == i)?'current':'')
                .replace('%index%', i.toString())
        );
        this.tapeEl.push($el);
        $el.on('click', function (e) {
            self.controller.setIndex($(this).data('index'));
            $.each(self.tapeEl, function (index) {
                if (self.tapeEl[index].hasClass('current')) {
                    self.tapeEl[index].removeClass('current');
                }
            });
            $(this).addClass('current');
            e.preventDefault();
        });
        this.$tape.append($el);
    }
};
TuringMachineUI.prototype.setTape = function (tape) {
    this.controller.setTape(tape.split(''));
    this.displayTape();
};
TuringMachineUI.prototype.resetRules = function () {
    this.controller.resetRules();
    $('.rules').html("");
};
TuringMachineUI.prototype.resetTape = function () {
    this.setTape('_');
    return this;
};
TuringMachineUI.prototype.setAlphabet = function (alphabet) {
    this.controller.setAlphabet(alphabet);
    $('#alphabet').val(alphabet.join(''));
};
TuringMachineUI.prototype.registerHandlers = function () {
    var self = this;
    this.clearForm();
    var $form = $('.new-rule-form');
    var rules = $('.rules');
    rules.on('click', '.rule .delete', function (event) {
        self.controller.deleteRule($(this).parent().data('id'));
        $(this).parent().slideUp(function () {
            $(this).remove();
        });
        event.preventDefault();
    });

    $form.on('submit', function (e) {
        var fields = $(this).serializeArray();
        var data = {};
        for (var i = 0; i < fields.length; ++i) {
            data[fields[i].name] = fields[i].value;
        }
        self.addRule(data);
        self.setState(self.controller.getState());
        e.preventDefault();
    });
    $('.step').on('click', function () {
        self.step();
    });
    $('.run').on('click', function () {
        self.run();
    });
    $('.stop').on('click', function () {
        self.stop();
    });
    $('.tape-form').on('submit', function (e) {
        self.setTape($(this).find('input[type="text"]').val());
        e.preventDefault();
    });
    $('.tape-container').find('.tape-reset').on('click', function () {
        self.resetTape();
    });
    $('.save-form').on('submit', function (e) {
        if ($(this).find('input[type="text"]').val() == "") {
            alert('Name cannot be empty');
        } else {
            self.controller.setName($(this).find('input[type="text"]').val());
            self.controller.save(function (data) {
                self.addLoad(data);
            });
        }
        e.preventDefault();
    });
    $('#filename').fileupload({
        url:  config.backendURL + '/upload',
        done: function (e, data) {
            var dataObj = JSON.parse(data.result);
            self.setName(dataObj.name);
            self.setAlphabet(dataObj.alphabet);
            self.resetRules();
            for (var i = 0; i < dataObj.rules.length; ++i) {
                self.addRule(dataObj.rules[i]);
            }
            self.setState(null);
            self.resetTape();

        }
    });
    $('.alphabet-form').on('keyup', function (e) {
        self.controller.setAlphabet($(this).find('input[type="text"]').val().split(''));
        //e.preventDefault();
    });
};
TuringMachineUI.prototype.addLoad = function (data) {
    var self = this;
    var html = this.loadTemplate;

    var re = new RegExp('%id%', 'g');
    html = html.replace(re , data._id);
    re = new RegExp('%name%', 'g');
    html = html.replace(re , data.name);

    var $load = $(html);
    $load.on('click', 'a', function (e) {
        self.controller.load($(this).parent().data('id'), function (data) {
            self.resetRules();
            for (var i = 0; i < data.rules.length; ++i) {
                self.addRule(data.rules[i]);
            }
            self.setAlphabet(data.alphabet);
            self.setState(self.controller.getState());
            self.setName(data.name);
        });
        e.preventDefault();
    });
    $load.on('click', '.delete', function (e) {
        var $this = $(this).parent();
        self.controller.removeLoad($this.data('id'), function () {
            $this.fadeOut(function () {
                $(this).remove();
            });
        });
        e.preventDefault();
    });
    $load.on('click', '.download', function (e) {
        var id = $(this).parent().data('id');
        self.controller.download(id, function (data) {
            window.open(config.backendURL +'/download_trn/' + data);
        });
        e.preventDefault();
    });
    this.$loads.append($load);
};
TuringMachineUI.prototype.step = function (callback) {
    this.controller.step(function (message, state) {
        if (message != null) {
            $('.error-log').append("<p>" + message + "</p>");
        } else {
            this.setState(state);
        }
        callback && callback();
    }.bind(this));
    this.displayTape();
};
TuringMachineUI.prototype.setState = function (state) {
    this.controller.setState(state);
    $('li.rule').find('.state').css({
        backgroundColor: 'white'
    });
    $('li.rule[data-state="' + this.controller.getState() + '"]').find('.state').css({
        backgroundColor: 'rgb(39, 174, 96)'
    });
    $('.tape-container').find('.state').html("State: " + this.controller.getState());
};
TuringMachineUI.prototype.setName = function(name) {
    this.$saveForm.find('input[type="text"]').val(name);
};
TuringMachineUI.prototype.run = function () {
// -- {id, state, cell, replace, move, next}
    // If program not running
    if (this.timer == null) {
        this.step(function () {
            clearInterval(this.timer);
            this.timer = null;
        }.bind(this));
        this.timer = setInterval(function () {
            this.step(function () {
                clearInterval(this.timer);
            }.bind(this));
        }.bind(this), 1);
    }
};
TuringMachineUI.prototype.stop = function () {
    if (this.timer != null) {
        clearInterval(this.timer);
        this.timer = null;
    }

};
