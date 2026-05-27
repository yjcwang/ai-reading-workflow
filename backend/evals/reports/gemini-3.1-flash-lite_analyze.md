[CASE] n2_001
  latency: 3.29s
  Grammar
    expected:    ['おかげで', 'からといって', 'ものの']
    actual norm: ['おかげで', 'からといって', 'ものの']
    missing:     []
    extra:       []
    metrics:     matched=3, precision=1.00, recall=1.00, f1=1.00
  Vocab
    expected:    ['丁寧', '慣れる', '職場', '自信をなくす']
    actual norm: ['丁寧', '慣れる', '職場', '自信']
    missing:     ['自信をなくす']
    extra:       ['自信']
    metrics:     matched=3, precision=0.75, recall=0.75, f1=0.75

[CASE] n2_002
  latency: 2.97s
  Grammar
    expected:    ['ざるを得ない', 'とたん', 'とは思ってもみなかった']
    actual norm: ['ざるを得ない', 'たとたん', 'とは思ってもみなかった']
    missing:     ['とたん']
    extra:       ['たとたん']
    metrics:     matched=2, precision=0.67, recall=0.67, f1=0.67
  Vocab
    expected:    ['ざるを得ない', '降り出す']
    actual norm: ['思いもよらない', '急に', '降り出す']
    missing:     ['ざるを得ない']
    extra:       ['思いもよらない', '急に']
    metrics:     matched=1, precision=0.33, recall=0.50, f1=0.40

[CASE] n2_003
  latency: 4.27s
  Grammar
    expected:    ['だけでなく', 'に関して', 'べき', '一方で']
    actual norm: ['が求められている', 'に関して', 'べき', '一方で']
    missing:     ['だけでなく']
    extra:       ['が求められている']
    metrics:     matched=3, precision=0.75, recall=0.75, f1=0.75
  Vocab
    expected:    ['改善', '求められる', '生活環境', '行政', '観光地']
    actual norm: ['協力', '改善', '行政', '観光地']
    missing:     ['求められる', '生活環境']
    extra:       ['協力']
    metrics:     matched=3, precision=0.75, recall=0.60, f1=0.67

[CASE] n2_004
  latency: 3.70s
  Grammar
    expected:    ['にもかかわらず', 'ようだ', 'ようになってきた']
    actual norm: ['にもかかわらず', 'ようになってきた']
    missing:     ['ようだ']
    extra:       []
    metrics:     matched=2, precision=1.00, recall=0.67, f1=0.80
  Vocab
    expected:    ['努力', '欠かさず', '結果']
    actual norm: ['努力', '欠かさず']
    missing:     ['結果']
    extra:       []
    metrics:     matched=2, precision=1.00, recall=0.67, f1=0.80

[CASE] n2_005
  latency: 3.06s
  Grammar
    expected:    ['たほうがよい', 'ためには', 'だけに', 'とともに']
    actual norm: ['たほうがよい', 'だけに', 'とともに']
    missing:     ['ためには']
    extra:       []
    metrics:     matched=3, precision=1.00, recall=0.75, f1=0.86
  Vocab
    expected:    ['発言', '簡潔', '結論', '表情', '誤解', '述べる']
    actual norm: ['簡潔', '表情', '誤解']
    missing:     ['発言', '結論', '述べる']
    extra:       []
    metrics:     matched=3, precision=1.00, recall=0.50, f1=0.67

[CASE] n2_006
  latency: 3.48s
  Grammar
    expected:    ['ことがある', 'ことになっている', 'なしに', 'までに']
    actual norm: ['ことがある', 'ことになっている', '場合']
    missing:     ['なしに', 'までに']
    extra:       ['場合']
    metrics:     matched=2, precision=0.67, recall=0.50, f1=0.57
  Vocab
    expected:    ['受け付ける', '来店']
    actual norm: ['予約', '前日', '受け付ける', '来店']
    missing:     []
    extra:       ['予約', '前日']
    metrics:     matched=2, precision=0.50, recall=1.00, f1=0.67

[CASE] n2_007
  latency: 3.74s
  Grammar
    expected:    ['ことなく', '恐れがある', '際に']
    actual norm: ['ことなく', '際に']
    missing:     ['恐れがある']
    extra:       []
    metrics:     matched=2, precision=1.00, recall=0.67, f1=0.80
  Vocab
    expected:    ['医師', '症状', '相談', '自己判断']
    actual norm: ['恐れがある', '相談する', '自己判断']
    missing:     ['医師', '症状', '相談']
    extra:       ['恐れがある', '相談する']
    metrics:     matched=1, precision=0.33, recall=0.25, f1=0.29

[CASE] n2_008
  latency: 11.97s
  Grammar
    expected:    ['ことになりかねない', 'だけでなく', 'にあたって', 'まま']
    actual norm: ['かねない', 'にあたって']
    missing:     ['ことになりかねない', 'だけでなく', 'まま']
    extra:       ['かねない']
    metrics:     matched=1, precision=0.50, recall=0.25, f1=0.33
  Vocab
    expected:    ['なりかねない', '不十分', '住まい', '現地', '生活費']
    actual norm: ['出発', '現地', '生活費', '留学']
    missing:     ['なりかねない', '不十分', '住まい']
    extra:       ['出発', '留学']
    metrics:     matched=2, precision=0.50, recall=0.40, f1=0.44

Summary
Analyzer provider: gemini
Analyzer model:    gemini-3.1-flash-lite
Average latency:   4.56s
Grammar average precision: 0.82
Grammar average recall:    0.66
Grammar average f1:        0.72
Vocab average precision: 0.65
Vocab average recall:    0.58
Vocab average f1:        0.59