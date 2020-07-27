// ==UserScript==
// @name         Tou.tv SRT Loader
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Load SRT subtitle files on Tou.tv
// @author       Adrien Pyke
// @match        *://ici.tou.tv/*
// @grant        GM_addStyle
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
  'use strict';

  GM_addStyle(`
        .videocontainer .subtitle {
            position: absolute;
            bottom: 5rem;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 2rem;
        }

        .videocontainer .subtitle > i, .videocontainer .subtitle > em {
            font-style: italic;
        }

        .videocontainer .subtitle > b, .videocontainer .subtitle > strong {
            font-weight: bold;
        }

        .videocontainer .subtitle > u {
            text-decoration: underline;
        }
    `);

  const parseSubtitles = srt =>
    srt
      .trim()
      .split('\n\n')
      .map(sub =>
        sub.match(/\d+\n(\d+:\d+:\d+),\d+ --> (\d+:\d+:\d+),\d+\n((.*\n?)*)$/imu).slice(1)
      )
      .map(([start, end, text]) => ({ start, end, text: text.replace(/\n/gu, '<br>') }));

  const timeComparer = (time1, time2) => {
    const parseTime = time => {
      const [hours, minutes, seconds] = time.match(/(\d+:)?(\d+:)?(\d+)/u).slice(1);
      return {
        hours: parseInt(hours || 0),
        minutes: parseInt(minutes || 0),
        seconds: parseInt(seconds || 0)
      };
    };

    [time1, time2] = [time1, time2].map(parseTime);
    if (time1.hours !== time2.hours) {
      return time1.hours < time2.hours ? -1 : 1;
    } else if (time1.minutes !== time2.minutes) {
      return time1.minutes < time2.minutes ? -1 : 1;
    } else if (time1.seconds !== time2.seconds) {
      return time1.seconds < time2.seconds ? -1 : 1;
    }
    return 0;
  };

  waitForElems({
    sel: '.videocontainer',
    onmatch: video => {
      const subs = parseSubtitles(window.srt);
      const subContainer = document.createElement('div');
      subContainer.classList.add('subtitle');
      video.appendChild(subContainer);

      const interval = setInterval(() => {
        const timeNode = document.querySelector('.currentTime');
        if (!timeNode) {
          clearInterval(interval);
          return;
        }
        const time = timeNode.textContent;
        subContainer.innerHTML = subs
          .filter(({ start, end }) => timeComparer(time, start) >= 0 && timeComparer(time, end) < 0)
          .map(({ text }) => text)
          .join('');
      }, 500);
    }
  });
})();

window.srt = `
1
00:00:13,013 --> 00:00:15,015
<i>You know, my dear Paul,</i>
<i>all my life,</i>

2
00:00:15,182 --> 00:00:17,476
<i>I have judged and sentenced people...</i>

3
00:00:17,977 --> 00:00:20,103
I have judged my wife,
my children,

4
00:00:20,270 --> 00:00:24,024
I have judged my brother,
and I've even judged you sometimes.

5
00:00:24,191 --> 00:00:26,443
And then, one day,
out of the blue,

6
00:00:26,611 --> 00:00:29,822
you suddenly realize
that you are all alone.

7
00:00:33,660 --> 00:00:36,538
The Tumblebeck trial
is taking a toll on you.

8
00:00:36,704 --> 00:00:39,999
Yeah. Do you want to know why?

9
00:00:41,375 --> 00:00:44,127
Because I judged him.
Because I sentenced him.

10
00:00:44,294 --> 00:00:47,381
And because I was wrong.

11
00:01:06,066 --> 00:01:08,736
Ma'am, may I please enjoy

12
00:01:08,903 --> 00:01:12,782
a Friday night special
in your company?

13
00:01:14,533 --> 00:01:15,618
Karl!

14
00:01:56,450 --> 00:01:59,202
<i>We thought that your sister Sara died</i>
<i>of natural causes,</i>

15
00:01:59,369 --> 00:02:00,747
<i>but a 2nd examination indicates</i>

16
00:02:00,913 --> 00:02:02,915
that your sister was poisoned.

17
00:02:08,671 --> 00:02:10,547
For your own safety,
stop your investigation.

18
00:02:10,715 --> 00:02:13,051
I am the Attorney General,
I know what I'm talking about!

19
00:02:13,550 --> 00:02:17,847
Pierre, my sister Sara was
the most important person to me.

20
00:02:19,222 --> 00:02:21,308
This life robber must pay.

21
00:02:22,267 --> 00:02:24,854
Pierre, what happened to your neck?

22
00:02:25,021 --> 00:02:27,356
It's nothing,
just a shaving cut.

23
00:02:31,318 --> 00:02:32,862
I just received the results

24
00:02:33,029 --> 00:02:35,489
regarding the substance we found
in your sister Sara's blood.

25
00:02:35,657 --> 00:02:39,744
<i>The poison was made</i>
<i>with scorpion venom.</i>

26
00:02:39,911 --> 00:02:41,913
<i>Scorpion.</i>

27
00:02:43,622 --> 00:02:46,583
Pierre!
The killer is Pierre!

28
00:03:19,075 --> 00:03:20,409
Pierre...

29
00:03:23,453 --> 00:03:26,289
This way!

30
00:03:27,792 --> 00:03:29,168
I'm here!

31
00:03:51,565 --> 00:03:53,776
<i>You just watched</i>
<i>the season finale</i>

32
00:03:53,943 --> 00:03:55,694
<i>of</i> Justice's Law.

33
00:03:55,903 --> 00:03:57,237
<i>Next week,</i>
<i>at the same time,</i>

34
00:03:57,404 --> 00:03:59,866
<i>don't miss the premiere</i>
<i>of</i> Movie-Presents.

35
00:04:08,916 --> 00:04:09,917
So?

36
00:04:10,793 --> 00:04:12,003
So what?

37
00:04:16,048 --> 00:04:20,594
Well... What do you think?

38
00:04:25,307 --> 00:04:28,518
It's on par with
the rest of the season, I think.

39
00:04:34,483 --> 00:04:37,444
Could you be
a little bit more specific?

40
00:04:37,611 --> 00:04:40,280
You know, find an adjective
or something?

41
00:04:40,447 --> 00:04:41,991
Well, I'm not an expert.

42
00:04:43,117 --> 00:04:45,285
Mom, I can't sleep!

43
00:04:51,374 --> 00:04:52,751
"Incongruous."

44
00:04:54,377 --> 00:04:56,964
That's the adjective I would use.

45
00:04:59,508 --> 00:05:01,135
Come.

46
00:05:13,313 --> 00:05:15,149
<i>Hello, this is</i>
<i>Patrick's home line.</i>

47
00:05:16,108 --> 00:05:17,400
<i>Hello, my dear!</i>

48
00:05:17,567 --> 00:05:20,905
<i>You must be celebrating</i>
<i>the season's finale</i>

49
00:05:21,321 --> 00:05:23,657
<i>of your beautiful series!</i>

50
00:05:23,825 --> 00:05:25,742
<i>I'm calling to congratulate you.</i>

51
00:05:26,244 --> 00:05:28,662
<i>I just watched</i>
<i>the last episode and...</i>

52
00:05:29,080 --> 00:05:30,747
<i>I thought it was good.</i>

53
00:05:32,541 --> 00:05:35,752
<i>And I saw the ad</i>
<i>with the little critters...</i>

54
00:05:35,920 --> 00:05:38,713
<i>They're pretty funny!</i>
<i>Funny and filthy!</i>

55
00:05:42,676 --> 00:05:44,636
<i>This is the story</i>
<i>of Denis and Patrick,</i>

56
00:05:44,803 --> 00:05:46,638
<i>two screenwriters</i>
<i>with unlimited ambitions,</i>

57
00:05:46,805 --> 00:05:48,224
<i>but limited talent.</i>

58
00:05:48,390 --> 00:05:51,269
<i>In 2010, a popular TV network</i>
<i>hired them to write</i>

59
00:05:51,434 --> 00:05:53,855
<i>the screenplay for a new</i>
<i>legal and crime TV drama</i>

60
00:05:54,021 --> 00:05:56,648
<i>named</i> Justice's Law.

61
00:05:56,815 --> 00:05:58,525
<i>Despite a sizable audience,</i>

62
00:05:58,692 --> 00:06:01,153
<i>and an average 25% market share,</i>

63
00:06:01,320 --> 00:06:04,406
<i>TV critics lambasted the series.</i>

64
00:06:04,573 --> 00:06:06,242
<i>Even the most lenient critics</i>

65
00:06:06,449 --> 00:06:08,870
<i>had to underscore the flaws</i>

66
00:06:09,036 --> 00:06:12,372
<i>of the ridiculous</i>
<i>and unbelievable storyline.</i>

67
00:06:12,539 --> 00:06:14,374
<i>After the last episode was broadcasted,</i>

68
00:06:14,541 --> 00:06:17,003
<i>Denis and Patrick,</i>
<i>bitter and exhausted,</i>

69
00:06:17,169 --> 00:06:19,255
<i>decided to meet</i>
<i>in their favorite bar,</i>

70
00:06:19,421 --> 00:06:21,966
<i>in order to celebrate</i>
<i>their massive failure.</i>

71
00:06:22,133 --> 00:06:24,384
We should have put tits everywhere!

72
00:06:24,551 --> 00:06:26,511
The little lawyers,
pleading topless,

73
00:06:26,678 --> 00:06:27,846
topless assistants,

74
00:06:28,014 --> 00:06:30,473
topless judges, men,
women, who cares...

75
00:06:30,640 --> 00:06:33,393
Everyone showing their tits,
with holes in their stupid gowns

76
00:06:33,560 --> 00:06:35,478
so we can see
their stupid tits...

77
00:06:35,645 --> 00:06:38,149
You like saying the word "tits".

78
00:06:38,316 --> 00:06:41,193
Yes, I like it. Tits!

79
00:06:41,360 --> 00:06:44,280
You see...
Nobody gives a damn!

80
00:06:44,446 --> 00:06:47,449
Look around you,
nobody's paying attention to us.

81
00:06:47,616 --> 00:06:50,202
Mathieu said hi to us.

82
00:06:50,912 --> 00:06:52,412
Mathieu didn't say hi.

83
00:06:52,579 --> 00:06:54,497
Mathieu asked you
what you wanted to drink.

84
00:06:55,166 --> 00:06:57,459
And haven't you noticed
how slow he is at helping us?

85
00:07:00,879 --> 00:07:04,133
Mathieu, two more beers
and two vodkas.

86
00:07:08,428 --> 00:07:10,056
We are done!

87
00:07:12,432 --> 00:07:13,433
Excuse-me,

88
00:07:13,600 --> 00:07:15,102
can I ask you a favor?

89
00:07:17,396 --> 00:07:19,439
I wrote the screenplay
for a stupid TV show,

90
00:07:19,606 --> 00:07:20,774
but I'm still a human being.

91
00:08:35,890 --> 00:08:38,727
Denis?
What are you doing?

92
00:08:40,979 --> 00:08:42,398
<i>For 11 years, Judith has been</i>

93
00:08:42,564 --> 00:08:44,316
<i>a model spouse for Denis.</i>

94
00:08:44,483 --> 00:08:46,402
<i>Now, her heart is somewhere else,</i>

95
00:08:46,568 --> 00:08:48,611
<i>but Denis doesn't know it yet.</i>

96
00:08:58,414 --> 00:09:01,624
<i>"Last night's episode could have been,</i>
<i>like the rest of the series,</i>

97
00:09:01,791 --> 00:09:03,918
simply hard to digest,

98
00:09:04,086 --> 00:09:08,132
but it actually turned out
to be nausea-inducing."

99
00:09:09,799 --> 00:09:12,844
"Thanks to the writers who have come up
with a 'great finale'...

100
00:09:13,011 --> 00:09:14,388
'great finale' in quotes"...

101
00:09:14,554 --> 00:09:15,555
Bastards!

102
00:09:15,722 --> 00:09:18,476
"...taking their lurid and annoying
story-telling to the next level

103
00:09:18,641 --> 00:09:21,728
by showing us Valérie
drifting down a raging torrent

104
00:09:21,895 --> 00:09:24,856
yet remaining perfectly able
to solve

105
00:09:25,023 --> 00:09:27,817
the convoluted and utterly opaque plot
we've tried to follow

106
00:09:27,984 --> 00:09:29,445
for 11 painful episodes

107
00:09:29,611 --> 00:09:33,365
before the dull
and incongruous finale."

108
00:09:34,032 --> 00:09:35,409
Damn it, "incongruous"!

109
00:09:35,909 --> 00:09:39,330
"Have the two writers responsible
for this complete failure ever thought

110
00:09:39,497 --> 00:09:42,582
about the meaning
of the word 'verisimilitude'?"

111
00:09:42,749 --> 00:09:45,211
OK, enough self-flagellation!

112
00:10:06,856 --> 00:10:08,858
To the end of a beautiful dream.

113
00:10:10,026 --> 00:10:11,694
To the end of a beautiful dream.

114
00:11:26,228 --> 00:11:27,979
Can I tell you what I think?

115
00:11:28,688 --> 00:11:31,275
I do appreciate your efforts

116
00:11:31,442 --> 00:11:33,067
to protect me
from the rest of the world,

117
00:11:33,860 --> 00:11:38,574
but if you disagreed with the article,
you wouldn't have thrown it away.

118
00:11:39,115 --> 00:11:41,826
You would have read it again with me,
and it would have made us laugh,

119
00:11:41,993 --> 00:11:43,870
we would have called her an idiot...

120
00:11:49,834 --> 00:11:51,127
Maude?

121
00:11:52,962 --> 00:11:54,714
It's over with Dave.

122
00:11:57,593 --> 00:11:58,927
My God...

123
00:11:59,093 --> 00:12:02,348
Sorry, I didn't know you were here.
I didn't hear you coming in.

124
00:12:02,514 --> 00:12:05,267
She's going to sleep in our basement
for a week.

125
00:12:05,975 --> 00:12:07,936
Your TV show is not everything.

126
00:12:14,150 --> 00:12:17,529
Say what you want,
motherhood is not for everyone.

127
00:12:17,696 --> 00:12:19,323
It's heartbreaking...

128
00:12:29,916 --> 00:12:32,001
Yep, I heard.

129
00:12:33,044 --> 00:12:35,213
Welcome back.

130
00:12:35,381 --> 00:12:36,715
Hello, Rodrigue.

131
00:12:36,881 --> 00:12:39,343
The "star" is back.

132
00:12:41,928 --> 00:12:44,931
So? Did your thing work out in the end?

133
00:12:45,599 --> 00:12:48,935
Yes... We're pretty happy.

134
00:12:49,102 --> 00:12:51,104
We all watched it here.

135
00:12:59,655 --> 00:13:01,197
Have a good day!

136
00:13:14,168 --> 00:13:15,920
-Hi, Chantal.
-Hi.

137
00:13:16,087 --> 00:13:17,464
Are you working for Marie-Josée?

138
00:13:17,631 --> 00:13:19,924
"American cinema
and consumerist logic", right?

139
00:13:20,091 --> 00:13:21,719
Yes, I said I wanted to come back,

140
00:13:21,884 --> 00:13:24,053
and this is an opportunity.
I'm going to take over her course.

141
00:13:24,220 --> 00:13:27,474
Hopefully you won't see this
as a failure.

142
00:13:28,808 --> 00:13:31,770
Do you think you can
use your experience

143
00:13:31,936 --> 00:13:33,104
to enrich your class?

144
00:13:35,691 --> 00:13:37,900
Or maybe not?

145
00:13:39,277 --> 00:13:40,987
Excuse me. Léa!

146
00:13:41,154 --> 00:13:43,239
<i>Léa teaches Literature.</i>

147
00:13:43,407 --> 00:13:45,534
<i>She just received a call</i>
<i>from her publisher</i>

148
00:13:45,701 --> 00:13:47,661
<i>who told her</i>
<i>he was planning on destroying</i>

149
00:13:47,827 --> 00:13:50,372
<i>the remaining 1,200 unsold copies</i>
<i>of her first novel,</i>

150
00:13:50,539 --> 00:13:51,707
The Birthright's Distress,

151
00:13:51,873 --> 00:13:54,000
<i>in order to make some room</i>
<i>in his warehouse.</i>

152
00:13:54,167 --> 00:13:56,628
<i>The initial print run for the book</i>
<i>was 1,300 copies.</i>

153
00:13:56,836 --> 00:13:58,630
Léa! Wait!

154
00:13:59,590 --> 00:14:01,508
Look, I know you haven't opened
my emails

155
00:14:01,675 --> 00:14:03,009
so I'm going to sum it up for you.

156
00:14:03,176 --> 00:14:04,886
It ended yesterday.

157
00:14:05,053 --> 00:14:06,805
It was my worst experience ever.

158
00:14:06,971 --> 00:14:08,515
I feel totally relieved.

159
00:14:08,766 --> 00:14:10,351
I'd like us to start dating again.

160
00:14:10,517 --> 00:14:14,438
And you were right.
So I'm sorry, OK?

161
00:14:19,859 --> 00:14:22,780
I find your series misogynistic.

162
00:14:23,697 --> 00:14:24,698
How so?

163
00:14:24,864 --> 00:14:27,743
I saw hookers and girls
who get dragged by their hair.

164
00:14:27,909 --> 00:14:29,077
That's about it.

165
00:14:30,328 --> 00:14:32,163
Yeah, the hair...
It was Denis' idea.

166
00:14:32,955 --> 00:14:35,709
I did notice three or four good ideas.

167
00:14:35,875 --> 00:14:37,251
They were my ideas by the way.

168
00:14:38,712 --> 00:14:41,255
How is your relationship doing?

169
00:14:41,423 --> 00:14:43,341
Me and Denis?

170
00:14:43,801 --> 00:14:45,259
I haven't seen him for a month.

171
00:14:45,927 --> 00:14:48,137
Will you answer if I call you tonight?

172
00:14:49,431 --> 00:14:51,015
Don't call too late.

173
00:14:57,313 --> 00:14:59,107
<i>At the end of the day,</i>
<i>Denis and Patrick went</i>

174
00:14:59,273 --> 00:15:01,067
<i>to their producer's office</i>

175
00:15:01,234 --> 00:15:02,569
<i>for a last post mortem</i>

176
00:15:02,736 --> 00:15:06,989
<i>to seal the demise of</i> Justice's Law.

177
00:15:09,660 --> 00:15:11,285
Hi, guys!

178
00:15:11,453 --> 00:15:12,496
Hi.

179
00:15:14,122 --> 00:15:15,206
Hi.

180
00:15:16,667 --> 00:15:18,460
All right,
I know you've read the articles...

181
00:15:18,627 --> 00:15:20,044
No, Louise,
let me stop you right there.

182
00:15:20,211 --> 00:15:22,464
If you ask us
to stay positive one more time,

183
00:15:22,631 --> 00:15:23,757
I will shit on your table.

184
00:15:23,923 --> 00:15:25,676
That's not at all
what I was about to say.

185
00:15:25,843 --> 00:15:27,553
I wanted to tell you
to stay realistic.

186
00:15:27,719 --> 00:15:31,055
That's all. Come and take a look.

187
00:15:34,934 --> 00:15:37,563
There you go. Take a look.

188
00:15:39,021 --> 00:15:42,358
Henri has compiled every article
about the series

189
00:15:42,526 --> 00:15:44,026
since its first broadcast.

190
00:15:44,193 --> 00:15:46,195
Look, percentages don't lie.

191
00:15:46,362 --> 00:15:48,030
Nice work, dear Henri!

192
00:15:48,197 --> 00:15:49,365
Those charts are beautiful!

193
00:15:49,533 --> 00:15:50,784
Surprisingly,

194
00:15:50,950 --> 00:15:54,120
43% of critics are "very positive"

195
00:15:54,287 --> 00:16:00,209
and 78% are between "average"
and "very positive".

196
00:16:00,376 --> 00:16:01,753
We don't read the same papers.

197
00:16:01,920 --> 00:16:04,631
I don't know which ones you read,
but some people read these...

198
00:16:05,339 --> 00:16:06,633
Here...

199
00:16:10,596 --> 00:16:12,556
Of course, if you start including

200
00:16:12,723 --> 00:16:15,433
the<i> Courrier de l'Estrie</i>
and<i> CKOX Radio-Témiscamingue,</i>

201
00:16:15,601 --> 00:16:17,226
it's not going to look as bad.

202
00:16:17,393 --> 00:16:19,646
I sent all this
to the broadcaster this morning.

203
00:16:20,271 --> 00:16:21,732
"The sinuous plot,

204
00:16:21,899 --> 00:16:25,486
increased tenfold by the musical
environment proved to be."

205
00:16:25,652 --> 00:16:26,570
Yes.

206
00:16:26,737 --> 00:16:29,280
It's not even a full sentence.
"Proved to be" what?

207
00:16:29,447 --> 00:16:32,743
"The plot proved to be"...
Look, it's very clear.

208
00:16:32,910 --> 00:16:34,536
Reading this doesn't help, Louise.

209
00:16:34,703 --> 00:16:37,163
To tell you the truth,
we didn't plan to stay here too long.

210
00:16:37,330 --> 00:16:40,626
We came by to pick up our checks,
that's about it.

211
00:16:40,792 --> 00:16:41,668
All right!

212
00:16:48,216 --> 00:16:49,133
Regardless,

213
00:16:49,300 --> 00:16:50,426
I have something to tell you.

214
00:16:52,178 --> 00:16:54,806
You can feel sorry for yourselves
all winter long,

215
00:16:54,973 --> 00:16:56,767
but no matter what,

216
00:16:57,475 --> 00:16:59,143
plan on being back at work

217
00:16:59,310 --> 00:17:00,979
on your computer at some point,

218
00:17:01,229 --> 00:17:03,189
because I just heard...

219
00:17:04,858 --> 00:17:07,360
that they ordered a second season!

220
00:17:08,820 --> 00:17:12,240
Same budget, same time slot!
They're losing their shit!

221
00:17:12,406 --> 00:17:14,993
Our audience has kept on increasing
week after week.

222
00:17:15,159 --> 00:17:18,037
The show is a hit, guys!
Holy shit!

223
00:17:18,246 --> 00:17:19,581
It's a hit!

224
00:17:34,470 --> 00:17:36,055
What do you say?

225
00:17:36,222 --> 00:17:37,265
It's out of question.

226
00:17:37,431 --> 00:17:39,851
It's like a nightmare that never ends.

227
00:17:40,018 --> 00:17:42,144
I'm warning you,
I might start crying again.

228
00:17:44,355 --> 00:17:45,398
Hi, man.

229
00:17:49,318 --> 00:17:50,654
Patrick Bouchard?

230
00:17:50,862 --> 00:17:51,738
Hi.

231
00:17:51,905 --> 00:17:53,782
Nice meeting you. Denis Rondeau?

232
00:17:53,949 --> 00:17:56,158
-Yes.
<i>-I'm a</i> fan.

233
00:17:57,118 --> 00:17:58,160
Thank you.

234
00:17:59,287 --> 00:18:02,331
One of your characters
really moved me.

235
00:18:03,291 --> 00:18:04,626
-Really?
-Yes.

236
00:18:04,793 --> 00:18:06,712
The one who ends up in jail.

237
00:18:07,336 --> 00:18:08,546
Which one?

238
00:18:08,922 --> 00:18:10,172
Short blonde guy, early 20s.

239
00:18:11,717 --> 00:18:14,803
Right, Marc Arcand!

240
00:18:18,306 --> 00:18:20,099
It makes you laugh?

241
00:18:21,643 --> 00:18:23,979
Only the name,
it always makes us laugh.

242
00:18:24,186 --> 00:18:27,315
Marc Arcand, Marc Arcand,
Marc Arcand. It's hard to say!

243
00:18:27,481 --> 00:18:29,233
It's just that I can feel

244
00:18:29,400 --> 00:18:31,527
that this guy is dealing with pain.

245
00:18:32,111 --> 00:18:33,739
True suffering.

246
00:18:34,990 --> 00:18:37,325
We don't know anything about him but...

247
00:18:38,159 --> 00:18:40,662
It's as if something tragic
was happening within his persona.

248
00:18:42,121 --> 00:18:44,123
Anyway, that's how I felt.

249
00:18:44,332 --> 00:18:48,586
No doubt his life is tragic
with a name like that!

250
00:18:52,841 --> 00:18:54,300
So you find pain laughable?

251
00:18:54,467 --> 00:18:57,511
We're laughing...
but it's only because of the name.

252
00:19:04,268 --> 00:19:06,021
Your show sucks.

253
00:19:18,700 --> 00:19:20,326
It was a pleasure.

254
00:19:25,874 --> 00:19:28,001
Look, we are very tired,
we didn't want...

255
00:19:28,167 --> 00:19:30,837
My name is Marc. OK?

256
00:19:52,191 --> 00:19:53,275
Guys!

257
00:19:55,028 --> 00:19:57,321
I wanted to apologize for earlier.

258
00:20:05,038 --> 00:20:06,915
I did time in prison, guys.

259
00:20:10,127 --> 00:20:12,336
There was a tragedy inside of me.

260
00:20:13,337 --> 00:20:15,381
When I was 8 years old,
I suffered a terrible trauma.

261
00:20:16,549 --> 00:20:18,760
I've started a therapy
to recover from it.

262
00:20:20,261 --> 00:20:22,346
I imagine you find that
laughable as well?

263
00:20:23,765 --> 00:20:27,226
I have the feeling that rape
must also make you laugh?

264
00:20:27,393 --> 00:20:29,813
OK. Man, we are sorry
for what happened earlier...

265
00:20:29,980 --> 00:20:32,023
My last name is Arcand!

266
00:20:32,190 --> 00:20:34,567
My name is Marc Arcand!

267
00:20:34,776 --> 00:20:38,571
OK, we weren't laughing at you.
He's just a character for us.

268
00:20:38,739 --> 00:20:40,489
This is totally random,
we don't know you...

269
00:20:40,656 --> 00:20:43,034
A father who rapes his 8-year-old son?

270
00:20:43,201 --> 00:20:44,870
Do you think it's funny?

271
00:20:48,372 --> 00:20:51,877
Wow, calm down, buddy!

272
00:20:53,711 --> 00:20:55,797
I'm going to give you
an action scene!

273
00:20:57,007 --> 00:20:58,549
Holy shit!

274
00:21:01,385 --> 00:21:02,595
Are you nuts? Stop it!

275
00:21:05,431 --> 00:21:06,892
Stop it!

276
00:21:07,058 --> 00:21:09,811
Please stop!

277
00:21:10,020 --> 00:21:13,314
Stop! We don't even know each other!

278
00:21:28,370 --> 00:21:31,208
If you don't know someone,
then keep your mouth shut.

279
00:21:32,625 --> 00:21:33,919
Assholes!

280
00:21:37,255 --> 00:21:40,591
Denis, are you OK?
Talk to me, man! Denis!

281
00:22:02,321 --> 00:22:06,367
Maude is really miserable,
she's going to sleep with me.

282
00:22:06,450 --> 00:22:08,829
You can sleep downstairs.

283
00:22:21,842 --> 00:22:25,761
I totally swear!

284
00:22:25,929 --> 00:22:30,892
Literally:
"This life robber must pay."

285
00:22:31,767 --> 00:22:33,644
Isn't there some form of derision
in there?

286
00:22:33,854 --> 00:22:37,315
Some off-beat humor?

287
00:22:37,481 --> 00:22:40,110
Not at all.
It's totally meant to be serious.

288
00:22:41,069 --> 00:22:42,904
But it's painful.

289
00:22:43,404 --> 00:22:47,825
It's painful for him, for sure,
but for me as well.

290
00:22:47,993 --> 00:22:50,661
Everything he touches turns to shit.

291
00:23:13,143 --> 00:23:16,520
-You should go to the hospital.
-Judith, I'll be all right.

292
00:23:17,646 --> 00:23:19,274
I checked some YouTube videos

293
00:23:19,481 --> 00:23:20,942
on how to deal with such wounds.

294
00:23:21,109 --> 00:23:22,944
It was very easy to understand.

295
00:23:29,200 --> 00:23:30,327
Thank you.

296
00:23:57,728 --> 00:23:58,980
I'll be back.

297
00:24:42,856 --> 00:24:45,235
-What are you doing here?
-Can I look into your library?

298
00:24:45,402 --> 00:24:47,486
-What?
-I just need to take a look.

299
00:24:47,695 --> 00:24:48,696
It won't be long.

300
00:24:53,326 --> 00:24:55,911
Does it ever occur to you
that you might be bothering me?

301
00:24:55,996 --> 00:24:56,829
Am I bothering you?

302
00:25:00,624 --> 00:25:01,459
Hi, Denis.

303
00:25:02,210 --> 00:25:04,628
-He's leaving. He's looking for...
-A book.

304
00:25:04,795 --> 00:25:06,047
Are you OK?

305
00:25:06,505 --> 00:25:08,466
Yes. I'm leaving.

306
00:25:08,632 --> 00:25:11,428
No worries,
make sure you get to catch up,

307
00:25:11,593 --> 00:25:14,513
I know you haven't seen
each other for a whole month.

308
00:25:17,267 --> 00:25:18,851
It won't be long.

309
00:25:20,437 --> 00:25:21,396
Jesus Christ!

310
00:25:21,562 --> 00:25:23,856
-How soon can you get away?
-Jesus Christ!

311
00:25:24,024 --> 00:25:25,316
I know this is awful timing,

312
00:25:25,483 --> 00:25:26,984
but I really need you
to come with me.

313
00:25:27,152 --> 00:25:28,777
-No way.
-It's a major emergency.

314
00:25:29,987 --> 00:25:32,740
Do you see my face?
I've hit rock bottom.

315
00:25:32,906 --> 00:25:34,367
I need psychological help!

316
00:25:34,533 --> 00:25:35,826
I got mugged!

317
00:25:36,618 --> 00:25:38,413
No. It's totally impossible.

318
00:25:38,579 --> 00:25:40,123
OK, I'll be waiting for you
in my car,

319
00:25:40,290 --> 00:25:43,084
come and join me
as soon as you can. Thank you!

320
00:25:43,251 --> 00:25:44,752
-Wait...
-Thank you!

321
00:26:09,735 --> 00:26:10,736
I don't think you realize

322
00:26:10,903 --> 00:26:13,073
all the sacrifices
I've made for your stupid TV show.

323
00:26:13,239 --> 00:26:14,907
Of course, it's my TV show now!

324
00:26:15,866 --> 00:26:18,035
Here I am, two years later,
left with nothing,

325
00:26:18,244 --> 00:26:19,496
and just when I'm thinking...

326
00:26:19,661 --> 00:26:22,039
No, the very night I'm thinking

327
00:26:22,207 --> 00:26:23,999
that I might actually get
some of my life back,

328
00:26:24,167 --> 00:26:25,918
you come out of nowhere
with your leprous face.

329
00:26:26,086 --> 00:26:27,669
OK, shut up! This is the place.

330
00:26:41,600 --> 00:26:43,478
Tell me what we're doing here,

331
00:26:43,644 --> 00:26:44,686
because if you don't,

332
00:26:44,853 --> 00:26:46,272
I'll break what's left of your face.

333
00:26:46,439 --> 00:26:48,525
-Do you have your cell?
-Of course.

334
00:26:48,690 --> 00:26:50,360
Does it have a flashlight?

335
00:26:50,568 --> 00:26:52,945
-Yes, why?
-Turn it on.

336
00:26:54,405 --> 00:26:55,532
Why?

337
00:26:58,326 --> 00:26:59,452
To be able to see in there.

338
00:27:04,124 --> 00:27:06,376
We don't hear an alarm,
but it could be silent.

339
00:27:06,543 --> 00:27:09,295
Come over here,
I have some instructions for you.

340
00:27:14,592 --> 00:27:16,136
Flashlight.

341
00:27:19,139 --> 00:27:22,267
Here. Now, please listen to me.

342
00:27:22,433 --> 00:27:24,185
In your hands,
you're holding the book

343
00:27:24,352 --> 00:27:26,728
<i>1001 Riddles</i>
<i>for Rainy Nights.</i>

344
00:27:26,895 --> 00:27:29,274
I used to wonder why
you had it in your library,

345
00:27:29,440 --> 00:27:30,358
but now I'm glad you did.

346
00:27:30,525 --> 00:27:31,984
In the "Difficult" section,

347
00:27:32,152 --> 00:27:34,154
you're going to pick
a riddle randomly,

348
00:27:34,320 --> 00:27:35,530
and you're going to read it to me.

349
00:27:35,696 --> 00:27:37,532
Afterwards, I swear,
I'll explain everything.

350
00:27:38,158 --> 00:27:41,369
They're short.
Go ahead.

351
00:27:43,163 --> 00:27:44,455
-Which one?
-Pick any of them.

352
00:27:44,622 --> 00:27:46,541
"Difficult" section.

353
00:27:46,707 --> 00:27:50,420
I can't believe it!
OK, "The Elevator Riddle".

354
00:27:51,421 --> 00:27:53,548
"Every morning,
a man living on the 20th floor

355
00:27:53,714 --> 00:27:55,799
takes the elevator to the ground floor
to go to work.

356
00:27:55,966 --> 00:27:57,218
Every night,
when he comes home,

357
00:27:57,385 --> 00:27:58,760
he takes the elevator
to the 10th floor

358
00:27:58,927 --> 00:28:00,846
and then takes the stairs
to the 20th floor.

359
00:28:01,013 --> 00:28:03,224
Why doesn't he take the elevator
to the 20th floor?"

360
00:28:03,391 --> 00:28:05,476
-Can I go now?
-OK. So the man lives

361
00:28:05,643 --> 00:28:07,562
on the 20th floor,

362
00:28:07,728 --> 00:28:10,105
goes to the ground floor,
and then on to work.

363
00:28:10,273 --> 00:28:12,983
He comes home from work,
takes the elevator to the 10th floor.

364
00:28:18,071 --> 00:28:19,865
What are you doing in there,
you idiot?

365
00:28:20,115 --> 00:28:23,118
OK, don't get me out
until I solve the riddle!

366
00:28:23,286 --> 00:28:24,579
What are you talking about?

367
00:28:24,745 --> 00:28:26,623
You're wearing boots,
you can't swim!

368
00:28:26,788 --> 00:28:28,291
You're going to drown!

369
00:28:28,458 --> 00:28:30,083
I think our finale was plausible,

370
00:28:30,251 --> 00:28:31,252
and I'm going to prove it!

371
00:28:32,085 --> 00:28:34,214
Valérie drowning in the river...

372
00:28:34,380 --> 00:28:37,217
while solving the enigma,
that's totally possible.

373
00:28:37,467 --> 00:28:42,472
My brain is hyperactive right now.

374
00:28:42,639 --> 00:28:45,891
My thinking is not impaired.
It's enhanced!

375
00:28:46,058 --> 00:28:47,685
I can't be a part of this anymore!

376
00:28:47,893 --> 00:28:49,895
My ideas are extremely clear.

377
00:28:50,271 --> 00:28:51,980
I could repeat the riddle...

378
00:28:53,483 --> 00:28:54,942
OK, no need to repeat the riddle.

379
00:28:55,108 --> 00:28:59,780
At least one of us
should escape madness.

380
00:28:59,947 --> 00:29:01,491
Come on, swim where you can stand!

381
00:29:01,658 --> 00:29:06,078
-I'm doing... very well.
-You're an asshole!

382
00:29:16,213 --> 00:29:18,173
He's driving me nuts!

383
00:29:23,429 --> 00:29:25,013
Denis!

384
00:29:27,392 --> 00:29:28,767
Jesus!

385
00:29:42,114 --> 00:29:43,658
He's a midget!

386
00:29:43,824 --> 00:29:45,033
What are you talking about?

387
00:29:45,242 --> 00:29:48,454
The riddle... The elevator...

388
00:29:48,870 --> 00:29:50,415
He's a midget!

389
00:29:55,794 --> 00:29:56,837
Bring me the book.

390
00:29:57,004 --> 00:29:58,589
Give me the keys,
I'll wait in the car.

391
00:29:58,756 --> 00:30:01,384
-Bring me the book, I want to know!
-Denis!

392
00:30:01,551 --> 00:30:03,678
The book for the keys, OK?

393
00:30:05,012 --> 00:30:08,725
Yes, the midget can press
the ground floor button.

394
00:30:09,224 --> 00:30:10,685
But when he comes back from work,

395
00:30:10,851 --> 00:30:12,770
he can only reach the 10th floor button.

396
00:30:12,936 --> 00:30:15,188
So he has to take the stairs

397
00:30:15,356 --> 00:30:18,359
to get to his apartment.

398
00:30:18,609 --> 00:30:21,069
-No, read the answer to me.
-The book for the keys.

399
00:30:21,236 --> 00:30:22,904
Read the answer!

400
00:30:31,163 --> 00:30:32,205
He's a midget.

401
00:30:35,834 --> 00:30:37,169
Here, take your fucking keys.

402
00:30:51,183 --> 00:30:52,810
I can't believe
I felt your tongue.

403
00:30:52,976 --> 00:30:55,145
I took advantage of the situation
to give you a French kiss!

404
00:30:55,312 --> 00:30:56,938
I'm telling you.
I felt your tongue.

405
00:30:57,105 --> 00:30:58,566
Sorry I offended your manhood,

406
00:30:58,733 --> 00:31:00,568
but I am not a registered nurse!

407
00:31:01,444 --> 00:31:03,363
I did it the same way
they do it in<i> Jaws 2:</i>

408
00:31:03,488 --> 00:31:04,321
I blew air in your mouth.

409
00:31:04,489 --> 00:31:06,073
<i>-Jaws 2?</i>
-Yes,<i> Jaws 2.</i>

410
00:31:06,239 --> 00:31:09,201
Chief Brody resuscitates his son
who just survived

411
00:31:09,369 --> 00:31:10,620
the shark attack.

412
00:31:10,787 --> 00:31:12,287
I used the same method.

413
00:31:12,497 --> 00:31:14,081
Thank you, Roy Scheider.

414
00:31:15,040 --> 00:31:16,875
You could say
"thank you, Patrick", as well.

415
00:31:18,586 --> 00:31:20,170
Thank you, Patrick.

416
00:31:23,633 --> 00:31:25,468
No, I'm telling you,
our finale was plausible.

417
00:31:25,635 --> 00:31:27,678
I know now,
because I experienced it myself.

418
00:31:27,845 --> 00:31:30,431
In a swimming pool, Jesus!
Get over it!

419
00:31:30,598 --> 00:31:32,307
I'm calling Louise
to confirm we're in.

420
00:31:33,308 --> 00:31:35,520
Is there still water in your ears?

421
00:31:35,686 --> 00:31:38,105
What part of "I won't do it"
don't you understand?

422
00:31:38,271 --> 00:31:40,982
I just had an epiphany.
I need you, Patrick, OK?

423
00:31:45,320 --> 00:31:47,072
<i>Léa, it's me.</i>

424
00:31:48,198 --> 00:31:49,199
I just wanted to tell you

425
00:31:49,366 --> 00:31:51,411
that I just ended
my relationship with Denis.

426
00:31:51,577 --> 00:31:53,036
It's over for real.

427
00:31:55,288 --> 00:31:59,460
I'd like you to come back.
There's some wine left.

428
00:32:01,044 --> 00:32:04,131
Well, I'll be here waiting for you.

429
00:32:31,950 --> 00:32:34,454
-What are you doing?
-Wow!

430
00:32:35,203 --> 00:32:36,873
You were just eating out my girlfriend?

431
00:32:38,248 --> 00:32:39,958
Denis, it's not what you think.

432
00:32:40,585 --> 00:32:43,671
We were just experimenting.
We've been drinking all night.

433
00:32:43,838 --> 00:32:45,798
When I drink, I don't end up
sucking off my buddies.

434
00:32:47,717 --> 00:32:49,134
What's going on? You're all wet.

435
00:32:49,301 --> 00:32:50,678
So are you, obviously.

436
00:32:53,723 --> 00:32:55,265
This is not turning into a threesome...

437
00:32:55,432 --> 00:32:56,391
No worries.

438
00:32:56,559 --> 00:32:59,896
I have more important things to do
to take control of my life.

439
00:33:07,653 --> 00:33:08,905
What are you doing?

440
00:33:09,655 --> 00:33:12,073
It seems that everything I touch
turns into shit.

441
00:33:15,953 --> 00:33:17,078
Good night.

442
00:33:56,076 --> 00:33:58,370
Judith has become a lesbian.

443
00:33:59,872 --> 00:34:03,584
Can I ask you one last favor?

444
00:34:04,334 --> 00:34:06,921
Can you drive me to my cabin?

445
00:34:07,379 --> 00:34:08,923
I don't want to sleep at my place.

446
00:34:09,089 --> 00:34:11,508
And I don't want to sleep here,
that would be too obvious.

447
00:34:11,676 --> 00:34:13,176
I want Judith to worry.

448
00:34:14,679 --> 00:34:16,806
It's 1:36 am.

449
00:34:18,390 --> 00:34:20,141
I've been disfigured,
I almost died,

450
00:34:20,308 --> 00:34:23,228
my girlfriend has become a lesbian.
I'm only asking you...

451
00:34:23,395 --> 00:34:25,898
OK, I'll get you some blankets.

452
00:34:26,064 --> 00:34:27,692
No, I want to go sleep in my cabin!

453
00:34:27,858 --> 00:34:30,443
Denis, I'm tired,
I have a class at 9:00 am tomorrow.

454
00:34:30,611 --> 00:34:32,362
OK, if you drive me to my cabin,

455
00:34:32,529 --> 00:34:34,991
I will leave you alone for one month.

456
00:34:42,790 --> 00:34:45,585
Have you thought about what I told you?
About season 2?

457
00:34:45,751 --> 00:34:48,754
Look, Denis, no more talking
while we drive...

458
00:34:53,508 --> 00:34:55,093
We must have left

459
00:34:55,260 --> 00:34:57,178
about one hour ago, right?

460
00:34:59,264 --> 00:35:01,308
It's very dark around here...

461
00:35:02,183 --> 00:35:04,311
I don't know this area very well.

462
00:35:08,691 --> 00:35:11,944
I have something to tell you.

463
00:35:12,653 --> 00:35:15,113
More like a confession actually.

464
00:35:15,322 --> 00:35:17,532
I don't think you're going to like it.

465
00:35:19,619 --> 00:35:22,747
Judith and I...
We...

466
00:35:22,955 --> 00:35:27,084
We sold the cabin
one month ago maybe.

467
00:35:27,250 --> 00:35:29,377
We did pretty good.

468
00:35:29,754 --> 00:35:32,798
We made a decent profit
considering how much we bought it for.

469
00:35:32,965 --> 00:35:37,094
But we don't own a cabin anymore.

470
00:35:38,804 --> 00:35:39,805
Get out!

471
00:35:40,640 --> 00:35:42,725
-You want me to get out right here?
-Get out!

472
00:35:43,643 --> 00:35:45,853
-OK, great.
-What do you mean, "great"?

473
00:35:46,020 --> 00:35:47,270
This is the perfect place.

474
00:35:48,229 --> 00:35:49,732
Marc Arcand was right:

475
00:35:49,899 --> 00:35:51,817
when you don't know,
shut the hell up.

476
00:35:51,984 --> 00:35:53,151
The pool has opened my eyes!

477
00:35:53,318 --> 00:35:55,195
Shut up!
Enough of that!

478
00:35:55,362 --> 00:35:57,447
In the finale, Valérie wakes up
lost and disoriented.

479
00:35:57,614 --> 00:35:59,574
I'm going to get lost
in order to write the next part.

480
00:35:59,742 --> 00:36:01,786
Are you familiar
with the effects of hypothermia?

481
00:36:01,952 --> 00:36:04,162
You have to experience pain
before you write about it.

482
00:36:04,329 --> 00:36:08,042
If we follow your stupid logic,
to write about Judge Boivin,

483
00:36:08,208 --> 00:36:09,877
I should experience a car accident?

484
00:36:10,044 --> 00:36:11,336
Maybe it's not such a bad idea.

485
00:36:11,503 --> 00:36:14,381
Just make sure
it's a minor accident.

486
00:36:14,882 --> 00:36:16,967
-What's that?
-Sleeping pills.

487
00:36:17,134 --> 00:36:19,302
Valérie was unconscious,
and I should be too.

488
00:36:20,470 --> 00:36:22,555
You crazy sicko, spit it back out!

489
00:36:22,723 --> 00:36:24,809
-Nope.
-Spit it out!

490
00:36:26,143 --> 00:36:27,268
Will you spit it out?

491
00:36:28,645 --> 00:36:30,147
Too late, I swallowed them!

492
00:36:39,239 --> 00:36:41,867
You've wasted two years of my life,
but now, it's over!

493
00:36:42,034 --> 00:36:44,661
If you want to keep on wasting yours,
be my guest!

494
00:36:44,829 --> 00:36:47,622
There you go! Go back and live
the dull life that you hate!

495
00:36:47,790 --> 00:36:50,208
Go and see your little students.

496
00:36:50,375 --> 00:36:51,543
You'd love to fuck them,

497
00:36:51,711 --> 00:36:52,712
but you never will

498
00:36:52,878 --> 00:36:54,671
because you always
go back to Léa...

499
00:36:54,839 --> 00:36:56,799
<i>Léa and the foam dripping</i>
<i>from the side of her mouth...</i>

500
00:36:56,966 --> 00:36:59,051
You've always thought
it was disgusting,

501
00:36:59,217 --> 00:37:01,219
but suddenly, you're OK with it,

502
00:37:01,386 --> 00:37:03,806
-because you're desperate!
-Watch your mouth!

503
00:37:04,807 --> 00:37:06,391
You don't love Léa.
You've never loved her.

504
00:37:08,144 --> 00:37:12,397
I'm offering you a groundbreaking
screenwriting experiment!

505
00:37:12,564 --> 00:37:14,649
An experiment that could give

506
00:37:14,817 --> 00:37:17,527
new life to the creative process!

507
00:37:17,694 --> 00:37:19,071
But if you'd rather go back

508
00:37:19,237 --> 00:37:21,322
to your fucking boring lectures
on Orson Welles,

509
00:37:21,489 --> 00:37:22,992
even if no one cares,
be my guest!

510
00:37:26,494 --> 00:37:28,663
So you're asking me to choose

511
00:37:28,831 --> 00:37:31,208
between you and Orson Welles?
Is that right?

512
00:37:33,002 --> 00:37:34,044
Yes!

513
00:37:38,256 --> 00:37:40,717
Wait!
I need my handcuffs!

514
00:37:40,885 --> 00:37:43,012
I can't do it without my handcuffs!

515
00:38:18,713 --> 00:38:22,176
Léa, I know you're there,
I can hear your cell.

516
00:38:25,303 --> 00:38:27,514
OK, I'll stay here
until you open the door.

517
00:39:11,724 --> 00:39:12,977
I triggered the alarm.

518
00:39:14,602 --> 00:39:15,896
I love you.

519
00:39:16,437 --> 00:39:17,772
I know I've made some bad choices,

520
00:39:17,940 --> 00:39:20,317
but I want you to know
that I regret making them.

521
00:39:20,860 --> 00:39:23,320
You know, one day,
out of the blue,

522
00:39:23,486 --> 00:39:25,114
you realize
that you are all alone.

523
00:39:25,990 --> 00:39:28,449
Isn't that the Judge Boivin's line
in the finale?

524
00:39:28,616 --> 00:39:31,912
No. I don't know. I'm not the one
who writes these parts.

525
00:39:32,079 --> 00:39:34,123
I'm seeing someone else, Patrick.

526
00:39:34,622 --> 00:39:36,749
Tonight was just a way for me
to confirm my decision.

527
00:39:37,334 --> 00:39:39,336
What's your decision?

528
00:39:43,798 --> 00:39:47,261
Look, I'm only asking you
to wait five minutes.

529
00:39:47,427 --> 00:39:48,595
I'm going to talk to them.

530
00:39:48,761 --> 00:39:51,431
I'll tell them I triggered the alarm
by mistake, then I'll be back.

531
00:39:51,598 --> 00:39:53,058
Just five minutes!

532
00:39:55,936 --> 00:39:57,229
I'll be back.

533
00:40:05,653 --> 00:40:07,364
<i>We just received a call...</i>

534
00:40:09,033 --> 00:40:10,367
Mister Fireman!

535
00:40:18,334 --> 00:40:20,169
I think the smoke is coming
from upstairs.

536
00:40:20,336 --> 00:40:21,586
OK. Thank you.

537
00:41:00,583 --> 00:41:01,793
<i>It's me.</i>

538
00:41:03,212 --> 00:41:05,214
<i>I can't believe I'm saying this, but...</i>

539
00:41:06,423 --> 00:41:07,465
I'm calling to tell you

540
00:41:07,632 --> 00:41:09,926
that I'm going to write
season 2 with you.

541
00:42:10,945 --> 00:42:12,613
Patrick?

542
00:42:20,497 --> 00:42:21,956
This way!

543
00:42:39,766 --> 00:42:43,437
Oh no!
Were you in the car as well?

544
00:42:43,895 --> 00:42:46,482
What? No. I just fell down.

545
00:42:46,647 --> 00:42:48,024
OK, because we can't afford

546
00:42:48,192 --> 00:42:49,567
to suffer another casualty.

547
00:42:49,734 --> 00:42:51,487
Have you read the news?
It's out.

548
00:42:51,652 --> 00:42:53,571
We have a meeting with the broadcaster
in two days.

549
00:42:53,738 --> 00:42:55,656
They want to know
about the new direction.

550
00:42:55,823 --> 00:42:58,910
Have you done some work?
Should we find you a new partner?
`.trim();
