[CASE] n2_001
  latency: 61.02s
  Grammar
    expected:    ['おかげで', 'からといって', 'ものの']
    actual norm: []
    missing:     ['おかげで', 'からといって', 'ものの']
    extra:       []
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00
  Vocab
    expected:    ['丁寧', '慣れる', '職場', '自信をなくす']
    actual norm: []
    missing:     ['丁寧', '慣れる', '職場', '自信をなくす']
    extra:       []
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00
  error:            timed out

[CASE] n2_002
  latency: 60.01s
  Grammar
    expected:    ['ざるを得ない', 'とたん', 'とは思ってもみなかった']
    actual norm: []
    missing:     ['ざるを得ない', 'とたん', 'とは思ってもみなかった']
    extra:       []
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00
  Vocab
    expected:    ['ざるを得ない', '降り出す']
    actual norm: []
    missing:     ['ざるを得ない', '降り出す']
    extra:       []
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00
  error:            timed out

[CASE] n2_003
  latency: 54.72s
  Grammar
    expected:    ['だけでなく', 'に関して', 'べき', '一方で']
    actual norm: ['だけでなく', 'として', 'に関して', 'べき', '一方で']
    missing:     []
    extra:       ['として']
    metrics:     matched=4, precision=0.80, recall=1.00, f1=0.89
  Vocab
    expected:    ['改善', '求められる', '生活環境', '行政', '観光地']
    actual norm: ['住民', '協力', '地域', '改善', '求められている', '点', '生活環境', '行政', '観光地']
    missing:     ['求められる']
    extra:       ['住民', '協力', '地域', '求められている', '点']
    metrics:     matched=4, precision=0.44, recall=0.80, f1=0.57

[CASE] n2_004
  latency: 59.61s
  Grammar
    expected:    ['にもかかわらず', 'ようだ', 'ようになってきた']
    actual norm: ['にもかかわらず', 'ようだ', 'ようになってきた']
    missing:     []
    extra:       []
    metrics:     matched=3, precision=1.00, recall=1.00, f1=1.00
  Vocab
    expected:    ['努力', '欠かさず', '結果']
    actual norm: ['努力', '文章', '欠かさず', '結果']
    missing:     []
    extra:       ['文章']
    metrics:     matched=3, precision=0.75, recall=1.00, f1=0.86

[CASE] n2_005
  latency: 60.00s
  Grammar
    expected:    ['たほうがよい', 'ためには', 'だけに', 'とともに']
    actual norm: []
    missing:     ['たほうがよい', 'ためには', 'だけに', 'とともに']
    extra:       []
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00
  Vocab
    expected:    ['発言', '簡潔', '結論', '表情', '誤解', '述べる']
    actual norm: []
    missing:     ['発言', '簡潔', '結論', '表情', '誤解', '述べる']
    extra:       []
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00
  error:            timed out

[CASE] n2_006
  latency: 45.65s
  Grammar
    expected:    ['ことがある', 'ことになっている', 'なしに', 'までに']
    actual norm: ['ことがある', 'ことになっている', 'なしに', '場合 (は)']
    missing:     ['までに']
    extra:       ['場合 (は)']
    metrics:     matched=3, precision=0.75, recall=0.75, f1=0.75
  Vocab
    expected:    ['受け付ける', '来店']
    actual norm: ['予約', '前日', '受け付ける', '場合', '変更', '来店', '次回', '連絡']
    missing:     []
    extra:       ['予約', '前日', '場合', '変更', '次回', '連絡']
    metrics:     matched=2, precision=0.25, recall=1.00, f1=0.40

[CASE] n2_007
  latency: 41.24s
  Grammar
    expected:    ['ことなく', '恐れがある', '際に']
    actual norm: ['ことなく', '恐れがある', '際には']
    missing:     ['際に']
    extra:       ['際には']
    metrics:     matched=2, precision=0.67, recall=0.67, f1=0.67
  Vocab
    expected:    ['医師', '症状', '相談', '自己判断']
    actual norm: ['十分', '増やす', '症状', '自己判断', '量']
    missing:     ['医師', '相談']
    extra:       ['十分', '増やす', '量']
    metrics:     matched=2, precision=0.40, recall=0.50, f1=0.44

[CASE] n2_008
  latency: 60.04s
  Grammar
    expected:    ['ことになりかねない', 'だけでなく', 'にあたって', 'まま']
    actual norm: []
    missing:     ['ことになりかねない', 'だけでなく', 'にあたって', 'まま']
    extra:       []
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00
  Vocab
    expected:    ['なりかねない', '不十分', '住まい', '現地', '生活費']
    actual norm: []
    missing:     ['なりかねない', '不十分', '住まい', '現地', '生活費']
    extra:       []
    metrics:     matched=0, precision=0.00, recall=0.00, f1=0.00
  error:            timed out

Summary
Analyzer provider: deepseek
Analyzer model:    deepseek-v4-pro
Average latency:   55.29s
Grammar average precision: 0.40
Grammar average recall:    0.43
Grammar average f1:        0.41
Vocab average precision: 0.23
Vocab average recall:    0.41
Vocab average f1:        0.28