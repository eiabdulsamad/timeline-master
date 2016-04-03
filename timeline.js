/*!
 * timeline - jQuery Plugin
 * version: 1.0.0
 * @requires jQuery v1.6 or later
 *
 * Copyright 2016 Abdul Samad - eiabdulsamad@gmail.com
 *
 */

 (function($) {

  _opt = [];
  _thisScroll = [];
  _htInterval = [];

  $.fn.timeLine = function(options, opt) {

    var defaults = {
      wrapperHeight : '100%',
      valueTo : '.timelineData',
      outputFormat: 'mmmm yyyy',
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      visibleMonthNow: ['auto', 4],
      visibleMonthPrev: ['auto', 4],
      currentYear: new Date().getFullYear(),
      currentMonth: parseInt(new Date().getMonth()+1),
      visibleYears: 4,
      visibleCurrentYear: true,
      visibleNearestYear: ['currentYear', 3],
      autoSelectMonth: 'currentYear',
      collapseToggle: ['year', 12],
      minifyUI: true,
      expandMonthsSpeed: 400 
    }

    var tlOptions = $.extend( defaults, options );
    arry = $(this).selector;
    _opt[arry] = tlOptions;

    if (typeof opt != 'undefined') {
      return _opt[opt];
    }

    var selector = ($(this).selector).split(",");

    $(selector).each(function(index, el) {
      tmID = selector[index];
      wrapperHt(tmID)
      var timeLineAdd = '<div class="timeline-inner"><div class="for-scroll"></div><div class="line-vert"></div></div>';
      $(tmID).append(timeLineAdd);
      var timelineInner = $(tmID).find('.timeline-inner .for-scroll');

      for (vsy=0; vsy < tlOptions.visibleYears; vsy++) {
        var year = tlOptions.currentYear - vsy;
        timelineInner.append('<ul class="tl" data-year="'+year+'"><a class="year-button data-year-bt="'+year+'">'+year+'</a></ul>');
        timelineInner.find('ul[data-year="'+year+'"]').append('<span class="current-year">'+year+'</span>');
        if (vsy+1 == 1) {
          timelineInner.find('ul').addClass('first-year')
        }
        if (vsy+1 == tlOptions.visibleYears) {
          timelineInner.find('ul').last().addClass('last-year')
        }
      }
      if(tlOptions.visibleCurrentYear) {
        displayYearMonth(tlOptions.currentYear, tmID);
      }
    });  

    if(!(tlOptions.autoSelectMonth)== false) {
      autoSelectMonth(tmID);
    };

    heightLoad(tmID);

  }; 


  function heightLoad(tmID) {
    _thisScroll[tmID] = new IScroll((tmID +' .timeline-inner'), { mouseWheel: true, keyBindings: true });
    heightInterval(tmID);
  };

  function heightInterval(tmID) {
    var tlOptions = $.fn.timeLine(undefined, tmID);
    _htInterval[tmID] = setInterval(function(){ _thisScroll[tmID].refresh(); }, 0);
    setTimeout(function() {
      clearInterval(_htInterval[tmID]);
    }, tlOptions.expandMonthsSpeed);
  };

  function wrapperHt(tmID) {
    var tlOptions = $.fn.timeLine(undefined, tmID),
     wrprHt = tlOptions.wrapperHeight;

    if((jQuery.type( wrprHt ) === "string")&&(wrprHt.slice(-1) == '%')) {
        var wrprHt = wrprHt.split(/\%/).join(""),
        parentHt = $(tmID).parent().outerHeight();
        $(tmID).height((wrprHt/100)*parentHt)
    } else {
      $(tmID).height(wrprHt)
    }
  }

  function displayYearMonth(year, tmID) {     
    $(tmID).find('ul li').slideUp('normal', function() {
      $(this).remove();
    });
    $(tmID).find('.year-button').css('display', 'block');
    multipleYearVisible(year, tmID);
  }

  function multipleYearVisible(year, tmID) {
    var tlOptions = $.fn.timeLine(undefined, tmID);
    $(tmID).find('ul').removeClass('visible-year');

    if((tlOptions.visibleNearestYear == 1) || (tlOptions.visibleNearestYear == true)) {
      firstYear = firstYearCheck(year, tmID);
      if(firstYear){
        bottomVisYear(year, tmID);
      } else {
        topVisYear(year, tmID);
      }
    } else if (tlOptions.visibleNearestYear == -1) {
      var lastYear = lastYearCheck(year, tmID);
      if(lastYear) {
        topVisYear(year, tmID);
      } else {
        bottomVisYear(year, tmID);
      }
    } else {
      autoMonthGen(year, tmID);
    };


    if(tlOptions.visibleNearestYear[0]=='currentYear') {
      if (currentYearCheck(year, tmID)) {
        if(totalAvailMonths(year, tmID) <= tlOptions.visibleNearestYear[1]) {
          if ($(tmID).find('ul[data-year="'+year+'"]').hasClass('visible-year')) {
            autoMonthGen(parseInt(year)-1, tmID);
            $(tmID).find('ul[data-year="'+(year-1)+'"]').addClass('visible-year');
          }
        }
      }
    }
  }

  function autoMonthGen(year, tmID) {
    var tlOptions = $.fn.timeLine(undefined, tmID);
    if (currentYearCheck(year, tmID)) {
      if (tlOptions.visibleMonthNow[0]=='auto') {
        var visibleM = tlOptions.visibleMonthNow[1],
        visibleMonth = visibleMonthPattern(year, tmID, visibleM);
        monthGen(year, tmID, visibleMonth);
      } else {
        monthGen(year, tmID);
      }
    } else {
      if ((tlOptions.visibleMonthPrev[0]=='auto')) {
        var visibleM = tlOptions.visibleMonthPrev[1],
        visibleMonth = visibleMonthPattern(year, tmID, visibleM);
        monthGen(year, tmID, visibleMonth);
      } else {
        monthGen(year, tmID);
      }
    }
    if(tlOptions.minifyUI) {
      minifyUIset(year, tmID)
    } else {
      $(tmID).find('ul[data-year="'+year+'"]').addClass('widerUI');
    }
  }

  function visibleMonthPattern(year, tmID, visibleM) {
    var yearSel = $(tmID).find('ul[data-year="'+year+'"]'),
    tlOptions = $.fn.timeLine(undefined, tmID),
    i=1, o=0;

    yearSel.attr('data-brgr', 6);
    if ((currentYearCheck(year, tmID) && tlOptions.currentMonth <= 4)) {
      visibleMonth=[i,i,i,i];
    } 
    else if ((currentYearCheck(year, tmID) && tlOptions.currentMonth == 5)) {
      visibleMonth=[i,i,o,i,i];
      yearSel.attr('data-brgr', 3);
    }
    else if ((currentYearCheck(year, tmID) && tlOptions.currentMonth == 6)) {
      visibleMonth=[i,i,o,o,i,i];
      yearSel.attr('data-brgr', 3);
    }
    else if ((currentYearCheck(year, tmID) && tlOptions.currentMonth == 7)) {
      visibleMonth=[i,o,o,o,i,i,i];
    }
    else if ((currentYearCheck(year, tmID) && tlOptions.currentMonth == 8)) {
      visibleMonth=[i,o,o,o,o,i,i,i];
    }
    else if ((currentYearCheck(year, tmID) && tlOptions.currentMonth == 9)) {
      visibleMonth=[i,o,o,o,o,o,i,i,i];
    }
    else if ((currentYearCheck(year, tmID) && tlOptions.currentMonth == 10)) {
      visibleMonth=[i,o,o,o,o,o,o,i,i,i];
    }
    else if ((currentYearCheck(year, tmID) && tlOptions.currentMonth == 11)) {
      visibleMonth=[i,o,o,o,o,o,o,o,i,i,i];
    }
    else if((!currentYearCheck(year, tmID)) || (currentYearCheck(year, tmID) && tlOptions.currentMonth == 12)) {

      switch (visibleM) {
        case 1: visibleMonth=[i];
        break;
        case 2: visibleMonth=[i,o,o,o,o,o,o,o,o,o,o,i];
        break;
        case 3: visibleMonth=[i,o,o,o,o,o,o,o,o,o,i,i];
        break;
        case 4: visibleMonth=[i,o,o,o,o,o,o,o,o,i,i,i];
        break;
        case 5: visibleMonth=[i,i,o,o,o,o,o,o,o,i,i,i];
        break;
        case 6: visibleMonth=[i,i,i,o,o,o,o,o,o,i,i,i];
        break;
        case 7: visibleMonth=[i,i,i,o,o,o,o,o,i,i,i,i];
        break;
        case 8: visibleMonth=[i,i,i,i,o,o,o,o,i,i,i,i];
        break;
        case 9: visibleMonth=[i,i,i,i,o,o,o,i,i,i,i,i];
        break;
        case 10: visibleMonth=[i,i,i,i,i,o,o,i,i,i,i,i];
        break;
        case 11: visibleMonth=[i,i,i,i,i,o,i,i,i,i,i,i];
        break;
        case 12: visibleMonth=[i,i,i,i,i,i,i,i,i,i,i,i];
        yearSel.attr('data-brgr', '');
        break;
        default: visibleMonth=[i,o,o,o,o,o,o,o,o,i,i,i];
      }
    }
    return visibleMonth;
  }

  function minifyUIset(year, tmID) {
    var currntSel = $(tmID).find('ul[data-year="'+year+'"]'),
    visiblePart = 'visibleTop';
    currntSel.addClass('minifyUI');
    brgrPost(year, tmID, visibleMonth);
    monthAnimate(year, tmID, visiblePart);
  };


  function monthGen(year, tmID, visibleMonth) {
    var tlOptions = $.fn.timeLine(undefined, tmID),
    currentYear = currentYearCheck(year, tmID);

    if (typeof visibleMonth == 'undefined') {
      if(currentYear) {
        var visibleMonth = tlOptions.visibleMonthNow;
      } else {
        var visibleMonth = tlOptions.visibleMonthPrev;      
      } 
    };


    $.each(tlOptions.months, function(i, month) {

      if((visibleMonth.length > 0) && (currentYear == 0)) {
        if(visibleMonth[i]==1) {
          appendMonth(year, tmID, month, i);
        } else {
          appendMonthHide(year, tmID, month, i);
        }
      } else {
        if ((i+1) <= tlOptions.currentMonth) {
          if (visibleMonth[i]==1) {
            appendMonth(year, tmID, month, i);
          } else {
            appendMonthHide(year, tmID, month, i);
          }
        } else {
          return false;
        }
      }
    });

    $(tmID).find('ul[data-year="'+year+'"]').addClass('visible-year');
    $(tmID).find('ul[data-year="'+year+'"] .year-button').css('display', 'none');

    expandMonths(year, tmID);
  }

  function topVisYear(year, tmID)  {
    for (var i = 0; i < 2; i++) {
      autoMonthGen(parseInt(year) + i, tmID);
      $(tmID).find('ul[data-year="'+year+'"]').addClass('visible-year');
    }
  }

  function bottomVisYear(year, tmID) {
    for (var i = 0; i < 2; i++) {
      autoMonthGen(parseInt(year) - i, tmID);
      $(tmID).find('ul[data-year="'+year+'"]').addClass('visible-year');
    }
  }

  function brgrPost(year, tmID, visibleMonth) {

    var tlOptions = $.fn.timeLine(undefined, tmID),
    currentYear = currentYearCheck(year, tmID);

    var currntSel = $(tmID).find('ul[data-year="'+year+'"]');
    var a=1, b=2, c=3, d=4, e=5, f=6, g=7, h=8, i=9, j=10, k=10;
    var posV1=4, posV2=4, posV3=8, posV4=1;
    if(currentYear) {
      switch (tlOptions.currentMonth) {
        case 11:  var g=6, h=7, i=8, j=9, k=9; 
        break;
        case 10:  var a=1, b=2, c=2, d=3, e=4, f=5, g=6, h=7, i=7, j=8, k=8;  
        var posV1=7, posV2=3, posV3=7, posV4=7;
        break;
        case 9:  var a=1, b=2, c=2, d=3, e=4, f=5, g=5, h=6, i=7, j=7, k=7;
        var posV1=3, posV2=3, posV3=6, posV4=6;
        break;
        case 8:  var a=1, b=2, c=2, d=3, e=4, f=5, g=5, h=6, i=6, j=6, k=6;
        var posV1=3, posV2=3, posV3=6, posV4=6;
        break;
        case 7:  var a=1, b=2, c=3, d=-1, e=-1, f=-1, g=-1, h=4, i=5, j=5, k=5;
        var posV1=0, posV2=4, posV3=4, posV4=0;
        break;
        case 6:  var a=1, b=2, c=2, d=-1, e=-1, f=-1, g=-1, h=3, i=4, j=4, k=4;
        var posV1=0, posV2=3, posV3=3, posV4=0;
        break;
        case 5:   var a=1, b=1, c=2, d=-1, e=-1, f=-1, g=-1, h=3, i=3, j=3, k=3;
        var posV1=0, posV2=3, posV3=3, posV4=0;
        break;  
      }
      if(tlOptions.currentMonth <= 4 && tlOptions.currentMonth > 0) {
        var a=1, b=2, c=3, d=-1, e=-1, f=-1, g=-1, h=4, i=4, j=4, k=4;
        var posV1=0, posV2=0, posV3=0, posV4=0;
      }
    }

    $.each([c, b, a], function(visibleMonth, i) {
      currntSel.find('li').eq(i).addClass('topGroup');
    });
    $.each([g, f, e, d], function(visibleMonth, i) {
      if (!(i==-1)) {
        currntSel.find('li').eq(i).addClass('centerGroup');
      }
    });
    $.each([k, j, i, h], function(visibleMonth, i) {
      currntSel.find('li').eq(i).addClass('bottomGroup');
    });
    currntSel.attr({'data-posV1': posV1, 'data-posV2': posV2, 'data-posV3': posV3, 'data-posV4': posV4,});
  }

  function currentYearCheck(year, tmID) {
    var tlOptions = $.fn.timeLine(undefined, tmID);

    if(year == tlOptions.currentYear) {
      var currentYear = 1;
    } else {
      var currentYear = 0;
    }
    return currentYear;
  }

  function appendMonth(year, tmID, month, i) {
    var i = i+1;
    $(tmID).find('ul[data-year="'+year+'"]').prepend('<li data-month="'+i+'"><a>'+month+'</a></li>');
  }

  function appendMonthHide(year, tmID, month, i) {  
    var tlOptions = $.fn.timeLine(undefined, tmID),
    i = i+1;
    if (tlOptions.minifyUI) {
      returnTmp = "";
    } else {
      returnTmp = "returnTmp";
    }
    $(tmID).find('ul[data-year="'+year+'"]').prepend('<li class="hideMonth '+returnTmp+'" data-month="'+i+'"><a>'+month+'</a></li>');
  }

  function totalAvailMonths(year, tmID) {
    return ($(tmID).find('ul[data-year="'+year+'"] li').length);
  }

  function hideOtherYear(year, tmID) {
    var thisYear = $(tmID).find('ul[data-year="'+year+'"]');
    $(tmID).find('ul').not(thisYear).each(function(){
      $(this).removeClass('visible-year');
      $(this).children('.current-year').hide();
      $(this).children('.year-button').show();
      $(this).children('.expand-months, .collapse-months').remove();
      $(this).children('li').remove();
    });
  }


  function lastYearCheck(year, tmID) {
    var currntSel = $(tmID).find('ul[data-year="'+year+'"]');
    if (currntSel.find('ul[data-year="'+year+'"]').hasClass('last-year')) {
      return true;
    }
  }

  function firstYearCheck(year, tmID) {
    var currntSel = $(tmID).find('ul[data-year="'+year+'"]');
    if(typeof tmID != 'undefined') {
      currntSel = $(tmID).find('ul[data-year="'+year+'"]');
    }
    if (currntSel.hasClass('first-year')) {
      return true;
    }
  }

  function expandMonthReset(tmID) {
    if($(tmID).find('.openedAllM').length >=1) {
      yearOld = $(tmID).find('ul.openedAllM').attr('data-year');
      hideMonthBack(yearOld, tmID);
    }
  }

  function hideMonthBack(year, tmID) {
    var currntSel = $(tmID).find('ul[data-year="'+year+'"]');

    currntSel.removeClass('openedAllM');
    currntSel.removeClass('expandedYear');
    currntSel.find('.returnTmp').addClass('hideMonth');
    currntSel.find('.collapse-months').remove();
    expandMonths(year, tmID);
  }

  function expandMonths(year, tmID) {
    var tlOptions = $.fn.timeLine(undefined, tmID),
    currntSel = $(tmID).find('ul[data-year="'+year+'"]'),
    
    hideMonth = currntSel.find('.hideMonth'),
    returnTmp = currntSel.find('.returnTmp'),
    brgrPos = currntSel.attr('data-brgr');

    if(! tlOptions.minifyUI) {
      if(hideMonth.length >= 1) {
        currntSel.find('li').eq(brgrPos).before('<span class="expand-months"><i>&nbsp;</></span>');
      } 
      else if(returnTmp.length >= 1) {
        currntSel.find('li:last').after('<span class="collapse-months">&nbsp;</span>');
      }
    }
  }

  function pos(year, tmID) {
    var tlOptions = $.fn.timeLine(undefined, tmID);

    var currntSel = $(tmID).find('ul[data-year="'+year+'"]');

    var topChk = currntSel.find('.topGroup').hasClass('hideMonth'),
    centerChk = currntSel.find('.centerGroup').hasClass('hideMonth'),
    bottomChk = currntSel.find('.bottomGroup').hasClass('hideMonth');

    var posV1 = parseInt(currntSel.attr('data-posV1')),
    posV2 = parseInt(currntSel.attr('data-posV2')),
    posV3 = parseInt(currntSel.attr('data-posV3')),
    posV4 = parseInt(currntSel.attr('data-posV4'));

    currntSel.find('.expand-months').not('span[data-expand="visibleBottom"]').remove();
    currntSel.find('span[data-expand="visibleBottom"]').slideUp(tlOptions.expandMonthsSpeed, function() {
      $(this).remove();
    });

    if((! topChk) && (! posV1==0)) {
      currntSel.find('li').eq(posV1).before('<span class="expand-months" data-expand="visibleCenter"><i>&nbsp;</i></span>');
      
    }
    if(! centerChk) {
      if(! posV2==0) {
        currntSel.find('li').eq(posV2).before('<span class="expand-months" data-expand="visibleTop"><i>&nbsp;</i></span>');
      }
      if(! posV3==0) {
        currntSel.find('li').eq(posV3).before('<span class="expand-months" data-expand="visibleBottom"><i>&nbsp;</i></span>');
      }
    }
    if((! bottomChk) && (! posV4==0)) {
      currntSel.find('li').eq(posV4).before('<span class="expand-months" data-expand="visibleCenter"><i>&nbsp;</i></span>');
    }

    if((! centerChk) && (!topChk)) {
      currntSel.find('span[data-expand="visibleTop"]').remove(); 
    }

    if((! centerChk) && (!bottomChk)) {
      currntSel.find('span[data-expand="visibleBottom"]').remove(); 
    }
  }

  function monthAnimate(year, tmID, visiblePart) {
    var tlOptions = $.fn.timeLine(undefined, tmID);
    
    var topGrp = $(tmID).find('ul[data-year="'+year+'"] .topGroup'),
    centerGrp = $(tmID).find('ul[data-year="'+year+'"] .centerGroup'),
    bottomGrp = $(tmID).find('ul[data-year="'+year+'"] .bottomGroup');

    if (visiblePart=='visibleTop') {
      centerGrp.slideUp(tlOptions.expandMonthsSpeed);
      bottomGrp.slideUp(tlOptions.expandMonthsSpeed);

      centerGrp.addClass('hideMonth');
      bottomGrp.addClass('hideMonth');

      topGrp.removeClass('hideMonth');
      topGrp.slideDown(tlOptions.expandMonthsSpeed);
      pos(year, tmID);
    }

    if (visiblePart=='visibleCenter') {
      topGrp.slideUp(tlOptions.expandMonthsSpeed);
      bottomGrp.slideUp(tlOptions.expandMonthsSpeed);

      topGrp.addClass('hideMonth');
      bottomGrp.addClass('hideMonth');

      centerGrp.removeClass('hideMonth');
      centerGrp.slideDown(tlOptions.expandMonthsSpeed);
      pos(year, tmID);
    }

    if (visiblePart=='visibleBottom') {
      topGrp.slideUp(tlOptions.expandMonthsSpeed);
      centerGrp.slideUp(tlOptions.expandMonthsSpeed);

      topGrp.addClass('hideMonth');
      centerGrp.addClass('hideMonth');
      
      bottomGrp.removeClass('hideMonth');
      bottomGrp.slideDown(tlOptions.expandMonthsSpeed);
      pos(year, tmID);
    }

  }

  outputFormatGen = function (monthOut, yearOut) {
    var tlOptions = $.fn.timeLine(undefined, tmID),
    sprtr = (' ,/,-,.,:').split(','),
    k= [],
    sp = '';

    $.each(sprtr, function(i, s) {
      if (tlOptions.outputFormat.indexOf(sprtr[i]) > -1) {
        outSection = tlOptions.outputFormat.split(sprtr[i]);

        $.each(outSection, function(p, m) {
          if(m.length > 3) {
            if(m.indexOf('m') > -1) {     
              k[p] = monthOut;
            } else {
              k[p] = yearOut;
            }
          } else {
            if(m.indexOf('m') > -1) {
              k[p] = monthOut.substring(0,3) 
            } else {
              k[p] = yearOut.slice(2)
            }
          }
          sp = i;
        });
      }
    });

    return k.join(" "+sprtr[sp]+" ");
  }

  function getValueElement(tmID) {
    var tlOptions = $.fn.timeLine(undefined, tmID),
    activeAncr = $(tmID).find('li a.active'),
    year = activeAncr.parents().eq(1).attr('data-year');
    activeAncrIndex = $(tmID).find(activeAncr).index('ul[data-year="'+year+'"] li a'),
    monthOut = activeAncr.text(),
    yearOut = activeAncr.parents().eq(1).attr('data-year'),
    recvdOut = outputFormatGen(monthOut, yearOut);
    
    if($(tlOptions.valueTo).is("input")) {
      $(tlOptions.valueTo).val(recvdOut).attr('data-val', activeAncrIndex +'-'+ (activeAncr.parents().eq(1).attr('data-year')));
    } else {
      $(tlOptions.valueTo).text(recvdOut).attr('data-val', activeAncrIndex +'-'+ (activeAncr.parents().eq(1).attr('data-year')));
    }
  }

  function autoSelectMonth (tmID) {
    var tlOptions = $.fn.timeLine(undefined, tmID);

    if(tlOptions.autoSelectMonth == 'currentYear') {
      if(! ($(tmID).find('ul').hasClass('pressed'))) {        
        setTimeout(function() {
          $(tmID).find('ul.first-year li:first a').addClass('active');
          getValueElement(tmID);
        },0);
      }
    }

    if(tlOptions.autoSelectMonth==true) {
      if($(tmID).find('ul').hasClass('pressed')) {

        setTimeout(function() {
          $(tmID).find('ul.pressed li').eq(0).find('a').addClass('active');
        },0);

        
      } else {
        $(tmID).find('ul.first-year li:first a').addClass('active');
      }
      setTimeout(function() {
        getValueElement(tmID);
      },0)
    }
    
  }


  $(window).resize(function() {
    $('.timeline').each(function(index, el) {
      var tmID = '#' + $(this).attr('id');
      wrapperHt(tmID);
    });
  });

//Click

$(document).on('click', '.expand-months', function(e) {

  var year = $(this).parent('ul').attr('data-year'),
  tmID = '#' + $(this).parents().eq(3).attr('id'),
  tlOptions = $.fn.timeLine(undefined, tmID);

  if(! tlOptions.minifyUI) {
    $(this).parent().addClass('expandedYear').find('li').removeClass('hideMonth');
    if ((tlOptions.collapseToggle) || (tlOptions.collapseToggle=='month')) {
      expandMonthReset(tmID);
      $(tmID).find('ul.openedAllM').removeClass('openedAllM');
      $(this).parent().addClass('openedAllM');
    } 
    expandMonths(year, tmID);
    $(this).remove();
    if (tlOptions.collapseToggle[0] == 'year') {
      if (firstYearCheck(year, tmID)) {
        if (totalAvailMonths(year) >= tlOptions.collapseToggle[1]) {
          hideOtherYear(year, tmID);
        }
      } else {
        hideOtherYear(year, tmID);
      }
    }
  } else {
    var visiblePart = $(this).attr('data-expand');
    monthAnimate(year, tmID, visiblePart)
  }

  heightInterval(tmID);
});

$(document).on('click', ".expandedYear .collapse-months",function(e) {
  year = $(this).parent('ul').attr('data-year');
  var tmID = '#' + $(this).parents().eq(3).attr('id'),
  tlOptions = $.fn.timeLine(undefined, tmID);
  hideMonthBack(year, tmID);
  
  heightInterval(tmID);
});

$(document).on('click', '.year-button', function(e) {
  var ul = $(this).parent('ul'),
  year = ul.attr('data-year');
  var tmID = '#' + $(this).parents().eq(3).attr('id');
  expandMonthReset(tmID);

  $(tmID).find('.expand-months, .collapse-months').remove();
  ul.addClass('pressed').siblings().removeClass('pressed');
  $(tmID).find('ul li a').removeClass('active');

var tlOptions = $.fn.timeLine(undefined, tmID),
dataVal = $(tlOptions.valueTo).attr('data-val');

if ((typeof dataVal != 'undefined') && (tlOptions.autoSelectMonth != true)) {
    getValAlrdy = dataVal.split('-');
    setTimeout(function() {
     $(tmID).find('ul[data-year="'+(parseInt(getValAlrdy[1]))+'"] li').eq((parseInt(getValAlrdy[0]))).children('a').addClass('active');
   }, tlOptions.expandMonthsSpeed);
 }

  autoSelectMonth(tmID);

  displayYearMonth(year, tmID);

  heightInterval(tmID);
});

$(document).on('click', '.timeline-inner ul li a', function(e) {
  $(this).parents().eq(3).find('ul li a').removeClass('active');
  $(this).addClass('active');
  var tmID = '#' + $(this).parents().eq(4).attr('id');

  getValueElement(tmID);
});


// -------------------

$(window).load(function() {

  var charSet = 'abcdefghijklmnopqrstuvwxyz0123456789',
  charSetSize = charSet.length, 
  charCount = 10, 
  idCount = 3,
  generatedIds = [];

  generateRandomId = function() {
    var id = '';
    for (var i = 1; i <= charCount; i++) {
      var randPos = Math.floor(Math.random() * charSetSize);
      id += charSet[randPos];
    }
    return id;
  },

  $('.timeline').each(function() {
    var id = 'tl'+generateRandomId(),
    chkIdAvail = $(this).attr('id');
    var tlOptions = $.fn.timeLine(undefined, '#'+chkIdAvail);

    if (typeof chkIdAvail == typeof undefined || chkIdAvail == false) {

      $(this).attr('id', id);
      $('#'+id).timeLine();
    } else if(typeof tlOptions== 'undefined') {
      $('#'+chkIdAvail).timeLine();
    }
  });
});


// iScroll---------------------------------------------------------------------------- 

/*! iScroll v5.1.3 ~ (c) 2008-2014 Matteo Spinelli ~ http://cubiq.org/license */
(function (window, document, Math) {
var rAF = window.requestAnimationFrame  ||
  window.webkitRequestAnimationFrame  ||
  window.mozRequestAnimationFrame   ||
  window.oRequestAnimationFrame   ||
  window.msRequestAnimationFrame    ||
  function (callback) { window.setTimeout(callback, 1000 / 60); };

var utils = (function () {
  var me = {};

  var _elementStyle = document.createElement('div').style;
  var _vendor = (function () {
    var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
      transform,
      i = 0,
      l = vendors.length;

    for ( ; i < l; i++ ) {
      transform = vendors[i] + 'ransform';
      if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
    }

    return false;
  })();

  function _prefixStyle (style) {
    if ( _vendor === false ) return false;
    if ( _vendor === '' ) return style;
    return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
  }

  me.getTime = Date.now || function getTime () { return new Date().getTime(); };

  me.extend = function (target, obj) {
    for ( var i in obj ) {
      target[i] = obj[i];
    }
  };

  me.addEvent = function (el, type, fn, capture) {
    el.addEventListener(type, fn, !!capture);
  };

  me.removeEvent = function (el, type, fn, capture) {
    el.removeEventListener(type, fn, !!capture);
  };

  me.prefixPointerEvent = function (pointerEvent) {
    return window.MSPointerEvent ? 
      'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
      pointerEvent;
  };

  me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
    var distance = current - start,
      speed = Math.abs(distance) / time,
      destination,
      duration;

    deceleration = deceleration === undefined ? 0.0006 : deceleration;

    destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
    duration = speed / deceleration;

    if ( destination < lowerMargin ) {
      destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
      distance = Math.abs(destination - current);
      duration = distance / speed;
    } else if ( destination > 0 ) {
      destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
      distance = Math.abs(current) + destination;
      duration = distance / speed;
    }

    return {
      destination: Math.round(destination),
      duration: duration
    };
  };

  var _transform = _prefixStyle('transform');

  me.extend(me, {
    hasTransform: _transform !== false,
    hasPerspective: _prefixStyle('perspective') in _elementStyle,
    hasTouch: 'ontouchstart' in window,
    hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
    hasTransition: _prefixStyle('transition') in _elementStyle
  });

  // This should find all Android browsers lower than build 535.19 (both stock browser and webview)
  me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

  me.extend(me.style = {}, {
    transform: _transform,
    transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
    transitionDuration: _prefixStyle('transitionDuration'),
    transitionDelay: _prefixStyle('transitionDelay'),
    transformOrigin: _prefixStyle('transformOrigin')
  });

  me.hasClass = function (e, c) {
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
    return re.test(e.className);
  };

  me.addClass = function (e, c) {
    if ( me.hasClass(e, c) ) {
      return;
    }

    var newclass = e.className.split(' ');
    newclass.push(c);
    e.className = newclass.join(' ');
  };

  me.removeClass = function (e, c) {
    if ( !me.hasClass(e, c) ) {
      return;
    }

    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
    e.className = e.className.replace(re, ' ');
  };

  me.offset = function (el) {
    var left = -el.offsetLeft,
      top = -el.offsetTop;

    // jshint -W084
    while (el = el.offsetParent) {
      left -= el.offsetLeft;
      top -= el.offsetTop;
    }
    // jshint +W084

    return {
      left: left,
      top: top
    };
  };

  me.preventDefaultException = function (el, exceptions) {
    for ( var i in exceptions ) {
      if ( exceptions[i].test(el[i]) ) {
        return true;
      }
    }

    return false;
  };

  me.extend(me.eventType = {}, {
    touchstart: 1,
    touchmove: 1,
    touchend: 1,

    mousedown: 2,
    mousemove: 2,
    mouseup: 2,

    pointerdown: 3,
    pointermove: 3,
    pointerup: 3,

    MSPointerDown: 3,
    MSPointerMove: 3,
    MSPointerUp: 3
  });

  me.extend(me.ease = {}, {
    quadratic: {
      style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fn: function (k) {
        return k * ( 2 - k );
      }
    },
    circular: {
      style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
      fn: function (k) {
        return Math.sqrt( 1 - ( --k * k ) );
      }
    },
    back: {
      style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fn: function (k) {
        var b = 4;
        return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
      }
    },
    bounce: {
      style: '',
      fn: function (k) {
        if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
          return 7.5625 * k * k;
        } else if ( k < ( 2 / 2.75 ) ) {
          return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
        } else if ( k < ( 2.5 / 2.75 ) ) {
          return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
        } else {
          return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
        }
      }
    },
    elastic: {
      style: '',
      fn: function (k) {
        var f = 0.22,
          e = 0.4;

        if ( k === 0 ) { return 0; }
        if ( k == 1 ) { return 1; }

        return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
      }
    }
  });

  me.tap = function (e, eventName) {
    var ev = document.createEvent('Event');
    ev.initEvent(eventName, true, true);
    ev.pageX = e.pageX;
    ev.pageY = e.pageY;
    e.target.dispatchEvent(ev);
  };

  me.click = function (e) {
    var target = e.target,
      ev;

    if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
      ev = document.createEvent('MouseEvents');
      ev.initMouseEvent('click', true, true, e.view, 1,
        target.screenX, target.screenY, target.clientX, target.clientY,
        e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
        0, null);

      ev._constructed = true;
      target.dispatchEvent(ev);
    }
  };

  return me;
})();

function IScroll (el, options) {
  this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
  this.scroller = this.wrapper.children[0];
  this.scrollerStyle = this.scroller.style;   // cache style for better performance

  this.options = {

    resizeScrollbars: true,

    mouseWheelSpeed: 40,

    snapThreshold: 0.334,

// INSERT POINT: OPTIONS 

    startX: 0,
    startY: 0,
    scrollY: true,
    directionLockThreshold: 5,
    momentum: true,

    bounce: true,
    bounceTime: 600,
    bounceEasing: '',

    preventDefault: true,
    preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

    HWCompositing: true,
    useTransition: true,
    useTransform: true
  };

  for ( var i in options ) {
    this.options[i] = options[i];
  }

  // Normalize options
  this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

  this.options.useTransition = utils.hasTransition && this.options.useTransition;
  this.options.useTransform = utils.hasTransform && this.options.useTransform;

  this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
  this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

  // If you want eventPassthrough I have to lock one of the axes
  this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
  this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

  // With eventPassthrough we also need lockDirection mechanism
  this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
  this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

  this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

  this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

  if ( this.options.tap === true ) {
    this.options.tap = 'tap';
  }

  if ( this.options.shrinkScrollbars == 'scale' ) {
    this.options.useTransition = false;
  }

  this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

// INSERT POINT: NORMALIZATION

  // Some defaults  
  this.x = 0;
  this.y = 0;
  this.directionX = 0;
  this.directionY = 0;
  this._events = {};

// INSERT POINT: DEFAULTS

  this._init();
  this.refresh();

  this.scrollTo(this.options.startX, this.options.startY);
  this.enable();
}

IScroll.prototype = {
  version: '5.1.3',

  _init: function () {
    this._initEvents();

    if ( this.options.scrollbars || this.options.indicators ) {
      this._initIndicators();
    }

    if ( this.options.mouseWheel ) {
      this._initWheel();
    }

    if ( this.options.snap ) {
      this._initSnap();
    }

    if ( this.options.keyBindings ) {
      this._initKeys();
    }

// INSERT POINT: _init

  },

  destroy: function () {
    this._initEvents(true);

    this._execEvent('destroy');
  },

  _transitionEnd: function (e) {
    if ( e.target != this.scroller || !this.isInTransition ) {
      return;
    }

    this._transitionTime();
    if ( !this.resetPosition(this.options.bounceTime) ) {
      this.isInTransition = false;
      this._execEvent('scrollEnd');
    }
  },

  _start: function (e) {
    // React to left mouse button only
    if ( utils.eventType[e.type] != 1 ) {
      if ( e.button !== 0 ) {
        return;
      }
    }

    if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
      return;
    }

    if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
      e.preventDefault();
    }

    var point = e.touches ? e.touches[0] : e,
      pos;

    this.initiated  = utils.eventType[e.type];
    this.moved    = false;
    this.distX    = 0;
    this.distY    = 0;
    this.directionX = 0;
    this.directionY = 0;
    this.directionLocked = 0;

    this._transitionTime();

    this.startTime = utils.getTime();

    if ( this.options.useTransition && this.isInTransition ) {
      this.isInTransition = false;
      pos = this.getComputedPosition();
      this._translate(Math.round(pos.x), Math.round(pos.y));
      this._execEvent('scrollEnd');
    } else if ( !this.options.useTransition && this.isAnimating ) {
      this.isAnimating = false;
      this._execEvent('scrollEnd');
    }

    this.startX    = this.x;
    this.startY    = this.y;
    this.absStartX = this.x;
    this.absStartY = this.y;
    this.pointX    = point.pageX;
    this.pointY    = point.pageY;

    this._execEvent('beforeScrollStart');
  },

  _move: function (e) {
    if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
      return;
    }

    if ( this.options.preventDefault ) {  // increases performance on Android? TODO: check!
      e.preventDefault();
    }

    var point   = e.touches ? e.touches[0] : e,
      deltaX    = point.pageX - this.pointX,
      deltaY    = point.pageY - this.pointY,
      timestamp = utils.getTime(),
      newX, newY,
      absDistX, absDistY;

    this.pointX   = point.pageX;
    this.pointY   = point.pageY;

    this.distX    += deltaX;
    this.distY    += deltaY;
    absDistX    = Math.abs(this.distX);
    absDistY    = Math.abs(this.distY);

    // We need to move at least 10 pixels for the scrolling to initiate
    if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
      return;
    }

    // If you are scrolling in one direction lock the other
    if ( !this.directionLocked && !this.options.freeScroll ) {
      if ( absDistX > absDistY + this.options.directionLockThreshold ) {
        this.directionLocked = 'h';   // lock horizontally
      } else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
        this.directionLocked = 'v';   // lock vertically
      } else {
        this.directionLocked = 'n';   // no lock
      }
    }

    if ( this.directionLocked == 'h' ) {
      if ( this.options.eventPassthrough == 'vertical' ) {
        e.preventDefault();
      } else if ( this.options.eventPassthrough == 'horizontal' ) {
        this.initiated = false;
        return;
      }

      deltaY = 0;
    } else if ( this.directionLocked == 'v' ) {
      if ( this.options.eventPassthrough == 'horizontal' ) {
        e.preventDefault();
      } else if ( this.options.eventPassthrough == 'vertical' ) {
        this.initiated = false;
        return;
      }

      deltaX = 0;
    }

    deltaX = this.hasHorizontalScroll ? deltaX : 0;
    deltaY = this.hasVerticalScroll ? deltaY : 0;

    newX = this.x + deltaX;
    newY = this.y + deltaY;

    // Slow down if outside of the boundaries
    if ( newX > 0 || newX < this.maxScrollX ) {
      newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
    }
    if ( newY > 0 || newY < this.maxScrollY ) {
      newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
    }

    this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
    this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

    if ( !this.moved ) {
      this._execEvent('scrollStart');
    }

    this.moved = true;

    this._translate(newX, newY);

/* REPLACE START: _move */

    if ( timestamp - this.startTime > 300 ) {
      this.startTime = timestamp;
      this.startX = this.x;
      this.startY = this.y;
    }

/* REPLACE END: _move */

  },

  _end: function (e) {
    if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
      return;
    }

    if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
      e.preventDefault();
    }

    var point = e.changedTouches ? e.changedTouches[0] : e,
      momentumX,
      momentumY,
      duration = utils.getTime() - this.startTime,
      newX = Math.round(this.x),
      newY = Math.round(this.y),
      distanceX = Math.abs(newX - this.startX),
      distanceY = Math.abs(newY - this.startY),
      time = 0,
      easing = '';

    this.isInTransition = 0;
    this.initiated = 0;
    this.endTime = utils.getTime();

    // reset if we are outside of the boundaries
    if ( this.resetPosition(this.options.bounceTime) ) {
      return;
    }

    this.scrollTo(newX, newY);  // ensures that the last position is rounded

    // we scrolled less than 10 pixels
    if ( !this.moved ) {
      if ( this.options.tap ) {
        utils.tap(e, this.options.tap);
      }

      if ( this.options.click ) {
        utils.click(e);
      }

      this._execEvent('scrollCancel');
      return;
    }

    if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
      this._execEvent('flick');
      return;
    }

    // start momentum animation if needed
    if ( this.options.momentum && duration < 300 ) {
      momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
      momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
      newX = momentumX.destination;
      newY = momentumY.destination;
      time = Math.max(momentumX.duration, momentumY.duration);
      this.isInTransition = 1;
    }


    if ( this.options.snap ) {
      var snap = this._nearestSnap(newX, newY);
      this.currentPage = snap;
      time = this.options.snapSpeed || Math.max(
          Math.max(
            Math.min(Math.abs(newX - snap.x), 1000),
            Math.min(Math.abs(newY - snap.y), 1000)
          ), 300);
      newX = snap.x;
      newY = snap.y;

      this.directionX = 0;
      this.directionY = 0;
      easing = this.options.bounceEasing;
    }

// INSERT POINT: _end

    if ( newX != this.x || newY != this.y ) {
      // change easing function when scroller goes out of the boundaries
      if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
        easing = utils.ease.quadratic;
      }

      this.scrollTo(newX, newY, time, easing);
      return;
    }

    this._execEvent('scrollEnd');
  },

  _resize: function () {
    var that = this;

    clearTimeout(this.resizeTimeout);

    this.resizeTimeout = setTimeout(function () {
      that.refresh();
    }, this.options.resizePolling);
  },

  resetPosition: function (time) {
    var x = this.x,
      y = this.y;

    time = time || 0;

    if ( !this.hasHorizontalScroll || this.x > 0 ) {
      x = 0;
    } else if ( this.x < this.maxScrollX ) {
      x = this.maxScrollX;
    }

    if ( !this.hasVerticalScroll || this.y > 0 ) {
      y = 0;
    } else if ( this.y < this.maxScrollY ) {
      y = this.maxScrollY;
    }

    if ( x == this.x && y == this.y ) {
      return false;
    }

    this.scrollTo(x, y, time, this.options.bounceEasing);

    return true;
  },

  disable: function () {
    this.enabled = false;
  },

  enable: function () {
    this.enabled = true;
  },

  refresh: function () {
    var rf = this.wrapper.offsetHeight;   // Force reflow

    this.wrapperWidth = this.wrapper.clientWidth;
    this.wrapperHeight  = this.wrapper.clientHeight;

/* REPLACE START: refresh */

    this.scrollerWidth  = this.scroller.offsetWidth;
    this.scrollerHeight = this.scroller.offsetHeight;

    this.maxScrollX   = this.wrapperWidth - this.scrollerWidth;
    this.maxScrollY   = this.wrapperHeight - this.scrollerHeight;

/* REPLACE END: refresh */

    this.hasHorizontalScroll  = this.options.scrollX && this.maxScrollX < 0;
    this.hasVerticalScroll    = this.options.scrollY && this.maxScrollY < 0;

    if ( !this.hasHorizontalScroll ) {
      this.maxScrollX = 0;
      this.scrollerWidth = this.wrapperWidth;
    }

    if ( !this.hasVerticalScroll ) {
      this.maxScrollY = 0;
      this.scrollerHeight = this.wrapperHeight;
    }

    this.endTime = 0;
    this.directionX = 0;
    this.directionY = 0;

    this.wrapperOffset = utils.offset(this.wrapper);

    this._execEvent('refresh');

    this.resetPosition();

// INSERT POINT: _refresh

  },

  on: function (type, fn) {
    if ( !this._events[type] ) {
      this._events[type] = [];
    }

    this._events[type].push(fn);
  },

  off: function (type, fn) {
    if ( !this._events[type] ) {
      return;
    }

    var index = this._events[type].indexOf(fn);

    if ( index > -1 ) {
      this._events[type].splice(index, 1);
    }
  },

  _execEvent: function (type) {
    if ( !this._events[type] ) {
      return;
    }

    var i = 0,
      l = this._events[type].length;

    if ( !l ) {
      return;
    }

    for ( ; i < l; i++ ) {
      this._events[type][i].apply(this, [].slice.call(arguments, 1));
    }
  },

  scrollBy: function (x, y, time, easing) {
    x = this.x + x;
    y = this.y + y;
    time = time || 0;

    this.scrollTo(x, y, time, easing);
  },

  scrollTo: function (x, y, time, easing) {
    easing = easing || utils.ease.circular;

    this.isInTransition = this.options.useTransition && time > 0;

    if ( !time || (this.options.useTransition && easing.style) ) {
      this._transitionTimingFunction(easing.style);
      this._transitionTime(time);
      this._translate(x, y);
    } else {
      this._animate(x, y, time, easing.fn);
    }
  },

  scrollToElement: function (el, time, offsetX, offsetY, easing) {
    el = el.nodeType ? el : this.scroller.querySelector(el);

    if ( !el ) {
      return;
    }

    var pos = utils.offset(el);

    pos.left -= this.wrapperOffset.left;
    pos.top  -= this.wrapperOffset.top;

    // if offsetX/Y are true we center the element to the screen
    if ( offsetX === true ) {
      offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
    }
    if ( offsetY === true ) {
      offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
    }

    pos.left -= offsetX || 0;
    pos.top  -= offsetY || 0;

    pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
    pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

    time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

    this.scrollTo(pos.left, pos.top, time, easing);
  },

  _transitionTime: function (time) {
    time = time || 0;

    this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

    if ( !time && utils.isBadAndroid ) {
      this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
    }


    if ( this.indicators ) {
      for ( var i = this.indicators.length; i--; ) {
        this.indicators[i].transitionTime(time);
      }
    }


// INSERT POINT: _transitionTime

  },

  _transitionTimingFunction: function (easing) {
    this.scrollerStyle[utils.style.transitionTimingFunction] = easing;


    if ( this.indicators ) {
      for ( var i = this.indicators.length; i--; ) {
        this.indicators[i].transitionTimingFunction(easing);
      }
    }


// INSERT POINT: _transitionTimingFunction

  },

  _translate: function (x, y) {
    if ( this.options.useTransform ) {

/* REPLACE START: _translate */

      this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

/* REPLACE END: _translate */

    } else {
      x = Math.round(x);
      y = Math.round(y);
      this.scrollerStyle.left = x + 'px';
      this.scrollerStyle.top = y + 'px';
    }

    this.x = x;
    this.y = y;


  if ( this.indicators ) {
    for ( var i = this.indicators.length; i--; ) {
      this.indicators[i].updatePosition();
    }
  }


// INSERT POINT: _translate

  },

  _initEvents: function (remove) {
    var eventType = remove ? utils.removeEvent : utils.addEvent,
      target = this.options.bindToWrapper ? this.wrapper : window;

    eventType(window, 'orientationchange', this);
    eventType(window, 'resize', this);

    if ( this.options.click ) {
      eventType(this.wrapper, 'click', this, true);
    }

    if ( !this.options.disableMouse ) {
      eventType(this.wrapper, 'mousedown', this);
      eventType(target, 'mousemove', this);
      eventType(target, 'mousecancel', this);
      eventType(target, 'mouseup', this);
    }

    if ( utils.hasPointer && !this.options.disablePointer ) {
      eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
      eventType(target, utils.prefixPointerEvent('pointermove'), this);
      eventType(target, utils.prefixPointerEvent('pointercancel'), this);
      eventType(target, utils.prefixPointerEvent('pointerup'), this);
    }

    if ( utils.hasTouch && !this.options.disableTouch ) {
      eventType(this.wrapper, 'touchstart', this);
      eventType(target, 'touchmove', this);
      eventType(target, 'touchcancel', this);
      eventType(target, 'touchend', this);
    }

    eventType(this.scroller, 'transitionend', this);
    eventType(this.scroller, 'webkitTransitionEnd', this);
    eventType(this.scroller, 'oTransitionEnd', this);
    eventType(this.scroller, 'MSTransitionEnd', this);
  },

  getComputedPosition: function () {
    var matrix = window.getComputedStyle(this.scroller, null),
      x, y;

    if ( this.options.useTransform ) {
      matrix = matrix[utils.style.transform].split(')')[0].split(', ');
      x = +(matrix[12] || matrix[4]);
      y = +(matrix[13] || matrix[5]);
    } else {
      x = +matrix.left.replace(/[^-\d.]/g, '');
      y = +matrix.top.replace(/[^-\d.]/g, '');
    }

    return { x: x, y: y };
  },

  _initIndicators: function () {
    var interactive = this.options.interactiveScrollbars,
      customStyle = typeof this.options.scrollbars != 'string',
      indicators = [],
      indicator;

    var that = this;

    this.indicators = [];

    if ( this.options.scrollbars ) {
      // Vertical scrollbar
      if ( this.options.scrollY ) {
        indicator = {
          el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
          interactive: interactive,
          defaultScrollbars: true,
          customStyle: customStyle,
          resize: this.options.resizeScrollbars,
          shrink: this.options.shrinkScrollbars,
          fade: this.options.fadeScrollbars,
          listenX: false
        };

        this.wrapper.appendChild(indicator.el);
        indicators.push(indicator);
      }

      // Horizontal scrollbar
      if ( this.options.scrollX ) {
        indicator = {
          el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
          interactive: interactive,
          defaultScrollbars: true,
          customStyle: customStyle,
          resize: this.options.resizeScrollbars,
          shrink: this.options.shrinkScrollbars,
          fade: this.options.fadeScrollbars,
          listenY: false
        };

        this.wrapper.appendChild(indicator.el);
        indicators.push(indicator);
      }
    }

    if ( this.options.indicators ) {
      // TODO: check concat compatibility
      indicators = indicators.concat(this.options.indicators);
    }

    for ( var i = indicators.length; i--; ) {
      this.indicators.push( new Indicator(this, indicators[i]) );
    }

    // TODO: check if we can use array.map (wide compatibility and performance issues)
    function _indicatorsMap (fn) {
      for ( var i = that.indicators.length; i--; ) {
        fn.call(that.indicators[i]);
      }
    }

    if ( this.options.fadeScrollbars ) {
      this.on('scrollEnd', function () {
        _indicatorsMap(function () {
          this.fade();
        });
      });

      this.on('scrollCancel', function () {
        _indicatorsMap(function () {
          this.fade();
        });
      });

      this.on('scrollStart', function () {
        _indicatorsMap(function () {
          this.fade(1);
        });
      });

      this.on('beforeScrollStart', function () {
        _indicatorsMap(function () {
          this.fade(1, true);
        });
      });
    }


    this.on('refresh', function () {
      _indicatorsMap(function () {
        this.refresh();
      });
    });

    this.on('destroy', function () {
      _indicatorsMap(function () {
        this.destroy();
      });

      delete this.indicators;
    });
  },

  _initWheel: function () {
    utils.addEvent(this.wrapper, 'wheel', this);
    utils.addEvent(this.wrapper, 'mousewheel', this);
    utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

    this.on('destroy', function () {
      utils.removeEvent(this.wrapper, 'wheel', this);
      utils.removeEvent(this.wrapper, 'mousewheel', this);
      utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
    });
  },

  _wheel: function (e) {
    if ( !this.enabled ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    var wheelDeltaX, wheelDeltaY,
      newX, newY,
      that = this;

    if ( this.wheelTimeout === undefined ) {
      that._execEvent('scrollStart');
    }

    // Execute the scrollEnd event after 400ms the wheel stopped scrolling
    clearTimeout(this.wheelTimeout);
    this.wheelTimeout = setTimeout(function () {
      that._execEvent('scrollEnd');
      that.wheelTimeout = undefined;
    }, 400);

    if ( 'deltaX' in e ) {
      if (e.deltaMode === 1) {
        wheelDeltaX = -e.deltaX * this.options.mouseWheelSpeed;
        wheelDeltaY = -e.deltaY * this.options.mouseWheelSpeed;
      } else {
        wheelDeltaX = -e.deltaX;
        wheelDeltaY = -e.deltaY;
      }
    } else if ( 'wheelDeltaX' in e ) {
      wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
      wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
    } else if ( 'wheelDelta' in e ) {
      wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
    } else if ( 'detail' in e ) {
      wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
    } else {
      return;
    }

    wheelDeltaX *= this.options.invertWheelDirection;
    wheelDeltaY *= this.options.invertWheelDirection;

    if ( !this.hasVerticalScroll ) {
      wheelDeltaX = wheelDeltaY;
      wheelDeltaY = 0;
    }

    if ( this.options.snap ) {
      newX = this.currentPage.pageX;
      newY = this.currentPage.pageY;

      if ( wheelDeltaX > 0 ) {
        newX--;
      } else if ( wheelDeltaX < 0 ) {
        newX++;
      }

      if ( wheelDeltaY > 0 ) {
        newY--;
      } else if ( wheelDeltaY < 0 ) {
        newY++;
      }

      this.goToPage(newX, newY);

      return;
    }

    newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
    newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

    if ( newX > 0 ) {
      newX = 0;
    } else if ( newX < this.maxScrollX ) {
      newX = this.maxScrollX;
    }

    if ( newY > 0 ) {
      newY = 0;
    } else if ( newY < this.maxScrollY ) {
      newY = this.maxScrollY;
    }

    this.scrollTo(newX, newY, 0);

// INSERT POINT: _wheel
  },

  _initSnap: function () {
    this.currentPage = {};

    if ( typeof this.options.snap == 'string' ) {
      this.options.snap = this.scroller.querySelectorAll(this.options.snap);
    }

    this.on('refresh', function () {
      var i = 0, l,
        m = 0, n,
        cx, cy,
        x = 0, y,
        stepX = this.options.snapStepX || this.wrapperWidth,
        stepY = this.options.snapStepY || this.wrapperHeight,
        el;

      this.pages = [];

      if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
        return;
      }

      if ( this.options.snap === true ) {
        cx = Math.round( stepX / 2 );
        cy = Math.round( stepY / 2 );

        while ( x > -this.scrollerWidth ) {
          this.pages[i] = [];
          l = 0;
          y = 0;

          while ( y > -this.scrollerHeight ) {
            this.pages[i][l] = {
              x: Math.max(x, this.maxScrollX),
              y: Math.max(y, this.maxScrollY),
              width: stepX,
              height: stepY,
              cx: x - cx,
              cy: y - cy
            };

            y -= stepY;
            l++;
          }

          x -= stepX;
          i++;
        }
      } else {
        el = this.options.snap;
        l = el.length;
        n = -1;

        for ( ; i < l; i++ ) {
          if ( i === 0 || el[i].offsetLeft <= el[i-1].offsetLeft ) {
            m = 0;
            n++;
          }

          if ( !this.pages[m] ) {
            this.pages[m] = [];
          }

          x = Math.max(-el[i].offsetLeft, this.maxScrollX);
          y = Math.max(-el[i].offsetTop, this.maxScrollY);
          cx = x - Math.round(el[i].offsetWidth / 2);
          cy = y - Math.round(el[i].offsetHeight / 2);

          this.pages[m][n] = {
            x: x,
            y: y,
            width: el[i].offsetWidth,
            height: el[i].offsetHeight,
            cx: cx,
            cy: cy
          };

          if ( x > this.maxScrollX ) {
            m++;
          }
        }
      }

      this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

      // Update snap threshold if needed
      if ( this.options.snapThreshold % 1 === 0 ) {
        this.snapThresholdX = this.options.snapThreshold;
        this.snapThresholdY = this.options.snapThreshold;
      } else {
        this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
        this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
      }
    });

    this.on('flick', function () {
      var time = this.options.snapSpeed || Math.max(
          Math.max(
            Math.min(Math.abs(this.x - this.startX), 1000),
            Math.min(Math.abs(this.y - this.startY), 1000)
          ), 300);

      this.goToPage(
        this.currentPage.pageX + this.directionX,
        this.currentPage.pageY + this.directionY,
        time
      );
    });
  },

  _nearestSnap: function (x, y) {
    if ( !this.pages.length ) {
      return { x: 0, y: 0, pageX: 0, pageY: 0 };
    }

    var i = 0,
      l = this.pages.length,
      m = 0;

    // Check if we exceeded the snap threshold
    if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
      Math.abs(y - this.absStartY) < this.snapThresholdY ) {
      return this.currentPage;
    }

    if ( x > 0 ) {
      x = 0;
    } else if ( x < this.maxScrollX ) {
      x = this.maxScrollX;
    }

    if ( y > 0 ) {
      y = 0;
    } else if ( y < this.maxScrollY ) {
      y = this.maxScrollY;
    }

    for ( ; i < l; i++ ) {
      if ( x >= this.pages[i][0].cx ) {
        x = this.pages[i][0].x;
        break;
      }
    }

    l = this.pages[i].length;

    for ( ; m < l; m++ ) {
      if ( y >= this.pages[0][m].cy ) {
        y = this.pages[0][m].y;
        break;
      }
    }

    if ( i == this.currentPage.pageX ) {
      i += this.directionX;

      if ( i < 0 ) {
        i = 0;
      } else if ( i >= this.pages.length ) {
        i = this.pages.length - 1;
      }

      x = this.pages[i][0].x;
    }

    if ( m == this.currentPage.pageY ) {
      m += this.directionY;

      if ( m < 0 ) {
        m = 0;
      } else if ( m >= this.pages[0].length ) {
        m = this.pages[0].length - 1;
      }

      y = this.pages[0][m].y;
    }

    return {
      x: x,
      y: y,
      pageX: i,
      pageY: m
    };
  },

  goToPage: function (x, y, time, easing) {
    easing = easing || this.options.bounceEasing;

    if ( x >= this.pages.length ) {
      x = this.pages.length - 1;
    } else if ( x < 0 ) {
      x = 0;
    }

    if ( y >= this.pages[x].length ) {
      y = this.pages[x].length - 1;
    } else if ( y < 0 ) {
      y = 0;
    }

    var posX = this.pages[x][y].x,
      posY = this.pages[x][y].y;

    time = time === undefined ? this.options.snapSpeed || Math.max(
      Math.max(
        Math.min(Math.abs(posX - this.x), 1000),
        Math.min(Math.abs(posY - this.y), 1000)
      ), 300) : time;

    this.currentPage = {
      x: posX,
      y: posY,
      pageX: x,
      pageY: y
    };

    this.scrollTo(posX, posY, time, easing);
  },

  next: function (time, easing) {
    var x = this.currentPage.pageX,
      y = this.currentPage.pageY;

    x++;

    if ( x >= this.pages.length && this.hasVerticalScroll ) {
      x = 0;
      y++;
    }

    this.goToPage(x, y, time, easing);
  },

  prev: function (time, easing) {
    var x = this.currentPage.pageX,
      y = this.currentPage.pageY;

    x--;

    if ( x < 0 && this.hasVerticalScroll ) {
      x = 0;
      y--;
    }

    this.goToPage(x, y, time, easing);
  },

  _initKeys: function (e) {
    // default key bindings
    var keys = {
      pageUp: 33,
      pageDown: 34,
      end: 35,
      home: 36,
      left: 37,
      up: 38,
      right: 39,
      down: 40
    };
    var i;

    // if you give me characters I give you keycode
    if ( typeof this.options.keyBindings == 'object' ) {
      for ( i in this.options.keyBindings ) {
        if ( typeof this.options.keyBindings[i] == 'string' ) {
          this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
        }
      }
    } else {
      this.options.keyBindings = {};
    }

    for ( i in keys ) {
      this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
    }

    utils.addEvent(window, 'keydown', this);

    this.on('destroy', function () {
      utils.removeEvent(window, 'keydown', this);
    });
  },

  _key: function (e) {
    if ( !this.enabled ) {
      return;
    }

    var snap = this.options.snap, // we are using this alot, better to cache it
      newX = snap ? this.currentPage.pageX : this.x,
      newY = snap ? this.currentPage.pageY : this.y,
      now = utils.getTime(),
      prevTime = this.keyTime || 0,
      acceleration = 0.250,
      pos;

    if ( this.options.useTransition && this.isInTransition ) {
      pos = this.getComputedPosition();

      this._translate(Math.round(pos.x), Math.round(pos.y));
      this.isInTransition = false;
    }

    this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

    switch ( e.keyCode ) {
      case this.options.keyBindings.pageUp:
        if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
          newX += snap ? 1 : this.wrapperWidth;
        } else {
          newY += snap ? 1 : this.wrapperHeight;
        }
        break;
      case this.options.keyBindings.pageDown:
        if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
          newX -= snap ? 1 : this.wrapperWidth;
        } else {
          newY -= snap ? 1 : this.wrapperHeight;
        }
        break;
      case this.options.keyBindings.end:
        newX = snap ? this.pages.length-1 : this.maxScrollX;
        newY = snap ? this.pages[0].length-1 : this.maxScrollY;
        break;
      case this.options.keyBindings.home:
        newX = 0;
        newY = 0;
        break;
      case this.options.keyBindings.left:
        newX += snap ? -1 : 5 + this.keyAcceleration>>0;
        break;
      case this.options.keyBindings.up:
        newY += snap ? 1 : 5 + this.keyAcceleration>>0;
        break;
      case this.options.keyBindings.right:
        newX -= snap ? -1 : 5 + this.keyAcceleration>>0;
        break;
      case this.options.keyBindings.down:
        newY -= snap ? 1 : 5 + this.keyAcceleration>>0;
        break;
      default:
        return;
    }

    if ( snap ) {
      this.goToPage(newX, newY);
      return;
    }

    if ( newX > 0 ) {
      newX = 0;
      this.keyAcceleration = 0;
    } else if ( newX < this.maxScrollX ) {
      newX = this.maxScrollX;
      this.keyAcceleration = 0;
    }

    if ( newY > 0 ) {
      newY = 0;
      this.keyAcceleration = 0;
    } else if ( newY < this.maxScrollY ) {
      newY = this.maxScrollY;
      this.keyAcceleration = 0;
    }

    this.scrollTo(newX, newY, 0);

    this.keyTime = now;
  },

  _animate: function (destX, destY, duration, easingFn) {
    var that = this,
      startX = this.x,
      startY = this.y,
      startTime = utils.getTime(),
      destTime = startTime + duration;

    function step () {
      var now = utils.getTime(),
        newX, newY,
        easing;

      if ( now >= destTime ) {
        that.isAnimating = false;
        that._translate(destX, destY);

        if ( !that.resetPosition(that.options.bounceTime) ) {
          that._execEvent('scrollEnd');
        }

        return;
      }

      now = ( now - startTime ) / duration;
      easing = easingFn(now);
      newX = ( destX - startX ) * easing + startX;
      newY = ( destY - startY ) * easing + startY;
      that._translate(newX, newY);

      if ( that.isAnimating ) {
        rAF(step);
      }
    }

    this.isAnimating = true;
    step();
  },
  handleEvent: function (e) {
    switch ( e.type ) {
      case 'touchstart':
      case 'pointerdown':
      case 'MSPointerDown':
      case 'mousedown':
        this._start(e);
        break;
      case 'touchmove':
      case 'pointermove':
      case 'MSPointerMove':
      case 'mousemove':
        this._move(e);
        break;
      case 'touchend':
      case 'pointerup':
      case 'MSPointerUp':
      case 'mouseup':
      case 'touchcancel':
      case 'pointercancel':
      case 'MSPointerCancel':
      case 'mousecancel':
        this._end(e);
        break;
      case 'orientationchange':
      case 'resize':
        this._resize();
        break;
      case 'transitionend':
      case 'webkitTransitionEnd':
      case 'oTransitionEnd':
      case 'MSTransitionEnd':
        this._transitionEnd(e);
        break;
      case 'wheel':
      case 'DOMMouseScroll':
      case 'mousewheel':
        this._wheel(e);
        break;
      case 'keydown':
        this._key(e);
        break;
      case 'click':
        if ( !e._constructed ) {
          e.preventDefault();
          e.stopPropagation();
        }
        break;
    }
  }
};
function createDefaultScrollbar (direction, interactive, type) {
  var scrollbar = document.createElement('div'),
    indicator = document.createElement('div');

  if ( type === true ) {
    scrollbar.style.cssText = 'position:absolute;z-index:9999';
    indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
  }

  indicator.className = 'iScrollIndicator';

  if ( direction == 'h' ) {
    if ( type === true ) {
      scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
      indicator.style.height = '100%';
    }
    scrollbar.className = 'iScrollHorizontalScrollbar';
  } else {
    if ( type === true ) {
      scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
      indicator.style.width = '100%';
    }
    scrollbar.className = 'iScrollVerticalScrollbar';
  }

  scrollbar.style.cssText += ';overflow:hidden';

  if ( !interactive ) {
    scrollbar.style.pointerEvents = 'none';
  }

  scrollbar.appendChild(indicator);

  return scrollbar;
}

function Indicator (scroller, options) {
  this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
  this.wrapperStyle = this.wrapper.style;
  this.indicator = this.wrapper.children[0];
  this.indicatorStyle = this.indicator.style;
  this.scroller = scroller;

  this.options = {
    listenX: true,
    listenY: true,
    interactive: false,
    resize: true,
    defaultScrollbars: false,
    shrink: false,
    fade: false,
    speedRatioX: 0,
    speedRatioY: 0
  };

  for ( var i in options ) {
    this.options[i] = options[i];
  }

  this.sizeRatioX = 1;
  this.sizeRatioY = 1;
  this.maxPosX = 0;
  this.maxPosY = 0;

  if ( this.options.interactive ) {
    if ( !this.options.disableTouch ) {
      utils.addEvent(this.indicator, 'touchstart', this);
      utils.addEvent(window, 'touchend', this);
    }
    if ( !this.options.disablePointer ) {
      utils.addEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
      utils.addEvent(window, utils.prefixPointerEvent('pointerup'), this);
    }
    if ( !this.options.disableMouse ) {
      utils.addEvent(this.indicator, 'mousedown', this);
      utils.addEvent(window, 'mouseup', this);
    }
  }

  if ( this.options.fade ) {
    this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
    this.wrapperStyle[utils.style.transitionDuration] = utils.isBadAndroid ? '0.001s' : '0ms';
    this.wrapperStyle.opacity = '0';
  }
}

Indicator.prototype = {
  handleEvent: function (e) {
    switch ( e.type ) {
      case 'touchstart':
      case 'pointerdown':
      case 'MSPointerDown':
      case 'mousedown':
        this._start(e);
        break;
      case 'touchmove':
      case 'pointermove':
      case 'MSPointerMove':
      case 'mousemove':
        this._move(e);
        break;
      case 'touchend':
      case 'pointerup':
      case 'MSPointerUp':
      case 'mouseup':
      case 'touchcancel':
      case 'pointercancel':
      case 'MSPointerCancel':
      case 'mousecancel':
        this._end(e);
        break;
    }
  },

  destroy: function () {
    if ( this.options.interactive ) {
      utils.removeEvent(this.indicator, 'touchstart', this);
      utils.removeEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
      utils.removeEvent(this.indicator, 'mousedown', this);

      utils.removeEvent(window, 'touchmove', this);
      utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
      utils.removeEvent(window, 'mousemove', this);

      utils.removeEvent(window, 'touchend', this);
      utils.removeEvent(window, utils.prefixPointerEvent('pointerup'), this);
      utils.removeEvent(window, 'mouseup', this);
    }

    if ( this.options.defaultScrollbars ) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  },

  _start: function (e) {
    var point = e.touches ? e.touches[0] : e;

    e.preventDefault();
    e.stopPropagation();

    this.transitionTime();

    this.initiated = true;
    this.moved = false;
    this.lastPointX = point.pageX;
    this.lastPointY = point.pageY;

    this.startTime  = utils.getTime();

    if ( !this.options.disableTouch ) {
      utils.addEvent(window, 'touchmove', this);
    }
    if ( !this.options.disablePointer ) {
      utils.addEvent(window, utils.prefixPointerEvent('pointermove'), this);
    }
    if ( !this.options.disableMouse ) {
      utils.addEvent(window, 'mousemove', this);
    }

    this.scroller._execEvent('beforeScrollStart');
  },

  _move: function (e) {
    var point = e.touches ? e.touches[0] : e,
      deltaX, deltaY,
      newX, newY,
      timestamp = utils.getTime();

    if ( !this.moved ) {
      this.scroller._execEvent('scrollStart');
    }

    this.moved = true;

    deltaX = point.pageX - this.lastPointX;
    this.lastPointX = point.pageX;

    deltaY = point.pageY - this.lastPointY;
    this.lastPointY = point.pageY;

    newX = this.x + deltaX;
    newY = this.y + deltaY;

    this._pos(newX, newY);

// INSERT POINT: indicator._move

    e.preventDefault();
    e.stopPropagation();
  },

  _end: function (e) {
    if ( !this.initiated ) {
      return;
    }

    this.initiated = false;

    e.preventDefault();
    e.stopPropagation();

    utils.removeEvent(window, 'touchmove', this);
    utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
    utils.removeEvent(window, 'mousemove', this);

    if ( this.scroller.options.snap ) {
      var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

      var time = this.options.snapSpeed || Math.max(
          Math.max(
            Math.min(Math.abs(this.scroller.x - snap.x), 1000),
            Math.min(Math.abs(this.scroller.y - snap.y), 1000)
          ), 300);

      if ( this.scroller.x != snap.x || this.scroller.y != snap.y ) {
        this.scroller.directionX = 0;
        this.scroller.directionY = 0;
        this.scroller.currentPage = snap;
        this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
      }
    }

    if ( this.moved ) {
      this.scroller._execEvent('scrollEnd');
    }
  },

  transitionTime: function (time) {
    time = time || 0;
    this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';

    if ( !time && utils.isBadAndroid ) {
      this.indicatorStyle[utils.style.transitionDuration] = '0.001s';
    }
  },

  transitionTimingFunction: function (easing) {
    this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
  },

  refresh: function () {
    this.transitionTime();

    if ( this.options.listenX && !this.options.listenY ) {
      this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
    } else if ( this.options.listenY && !this.options.listenX ) {
      this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
    } else {
      this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
    }

    if ( this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ) {
      utils.addClass(this.wrapper, 'iScrollBothScrollbars');
      utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

      if ( this.options.defaultScrollbars && this.options.customStyle ) {
        if ( this.options.listenX ) {
          this.wrapper.style.right = '8px';
        } else {
          this.wrapper.style.bottom = '8px';
        }
      }
    } else {
      utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
      utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

      if ( this.options.defaultScrollbars && this.options.customStyle ) {
        if ( this.options.listenX ) {
          this.wrapper.style.right = '2px';
        } else {
          this.wrapper.style.bottom = '2px';
        }
      }
    }

    var r = this.wrapper.offsetHeight;  // force refresh

    if ( this.options.listenX ) {
      this.wrapperWidth = this.wrapper.clientWidth;
      if ( this.options.resize ) {
        this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
        this.indicatorStyle.width = this.indicatorWidth + 'px';
      } else {
        this.indicatorWidth = this.indicator.clientWidth;
      }

      this.maxPosX = this.wrapperWidth - this.indicatorWidth;

      if ( this.options.shrink == 'clip' ) {
        this.minBoundaryX = -this.indicatorWidth + 8;
        this.maxBoundaryX = this.wrapperWidth - 8;
      } else {
        this.minBoundaryX = 0;
        this.maxBoundaryX = this.maxPosX;
      }

      this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));  
    }

    if ( this.options.listenY ) {
      this.wrapperHeight = this.wrapper.clientHeight;
      if ( this.options.resize ) {
        this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
        this.indicatorStyle.height = this.indicatorHeight + 'px';
      } else {
        this.indicatorHeight = this.indicator.clientHeight;
      }

      this.maxPosY = this.wrapperHeight - this.indicatorHeight;

      if ( this.options.shrink == 'clip' ) {
        this.minBoundaryY = -this.indicatorHeight + 8;
        this.maxBoundaryY = this.wrapperHeight - 8;
      } else {
        this.minBoundaryY = 0;
        this.maxBoundaryY = this.maxPosY;
      }

      this.maxPosY = this.wrapperHeight - this.indicatorHeight;
      this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
    }

    this.updatePosition();
  },

  updatePosition: function () {
    var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
      y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

    if ( !this.options.ignoreBoundaries ) {
      if ( x < this.minBoundaryX ) {
        if ( this.options.shrink == 'scale' ) {
          this.width = Math.max(this.indicatorWidth + x, 8);
          this.indicatorStyle.width = this.width + 'px';
        }
        x = this.minBoundaryX;
      } else if ( x > this.maxBoundaryX ) {
        if ( this.options.shrink == 'scale' ) {
          this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
          this.indicatorStyle.width = this.width + 'px';
          x = this.maxPosX + this.indicatorWidth - this.width;
        } else {
          x = this.maxBoundaryX;
        }
      } else if ( this.options.shrink == 'scale' && this.width != this.indicatorWidth ) {
        this.width = this.indicatorWidth;
        this.indicatorStyle.width = this.width + 'px';
      }

      if ( y < this.minBoundaryY ) {
        if ( this.options.shrink == 'scale' ) {
          this.height = Math.max(this.indicatorHeight + y * 3, 8);
          this.indicatorStyle.height = this.height + 'px';
        }
        y = this.minBoundaryY;
      } else if ( y > this.maxBoundaryY ) {
        if ( this.options.shrink == 'scale' ) {
          this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
          this.indicatorStyle.height = this.height + 'px';
          y = this.maxPosY + this.indicatorHeight - this.height;
        } else {
          y = this.maxBoundaryY;
        }
      } else if ( this.options.shrink == 'scale' && this.height != this.indicatorHeight ) {
        this.height = this.indicatorHeight;
        this.indicatorStyle.height = this.height + 'px';
      }
    }

    this.x = x;
    this.y = y;

    if ( this.scroller.options.useTransform ) {
      this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
    } else {
      this.indicatorStyle.left = x + 'px';
      this.indicatorStyle.top = y + 'px';
    }
  },

  _pos: function (x, y) {
    if ( x < 0 ) {
      x = 0;
    } else if ( x > this.maxPosX ) {
      x = this.maxPosX;
    }

    if ( y < 0 ) {
      y = 0;
    } else if ( y > this.maxPosY ) {
      y = this.maxPosY;
    }

    x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
    y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

    this.scroller.scrollTo(x, y);
  },

  fade: function (val, hold) {
    if ( hold && !this.visible ) {
      return;
    }

    clearTimeout(this.fadeTimeout);
    this.fadeTimeout = null;

    var time = val ? 250 : 500,
      delay = val ? 0 : 1000;

    val = val ? '1' : '0';

    this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

    this.fadeTimeout = setTimeout((function (val) {
      this.wrapperStyle.opacity = val;
      this.visible = +val;
    }).bind(this, val), delay);
  }
};

IScroll.utils = utils;

if ( typeof module != 'undefined' && module.exports ) {
  module.exports = IScroll;
} else {
  window.IScroll = IScroll;
}

})(window, document, Math);


}( jQuery ));
