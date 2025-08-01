# Chasm Crystallized - 결정화 캐즘

> **chasm** [ˈkæzəm]  
> _noun_ | _명사_
>
> (지질) 땅이나 암석, 표면 등에 생긴 깊고 큰 틈  
> _"A chasm opened in the ground after the earthquake."_  
> _(지진 후 땅에 커다란 틈이 생겼다.)_

> **crystallized** [ˈkristəˌlīzd]<br> > _adjective_ | _형용사_
>
> 1\. 결정으로 화하거나 결정의 형태를 가지다.<br>
> 2\. 명확하게 하거나, 확실하게 하다.<br>
> _"Chasm crystallized, illuminating a bright future."_<br/>
> _(열린 틈은 결정화되어 아름다운 미래를 비추었다.)_

## 소개

Chasm Crystallized(결정화 캐즘)은 유지보수되지 않고 있는 [원본 캐즘](https://github.com/chasm-js/guide)의 사후 지원을 진행하는 프로젝트입니다.

Chasm Snack을 기반으로 수정되었으며, 원본 캐즘 버전은 [6월 11일 업로드본(b7ac7ed)](https://github.com/chasm-js/snack/commit/b7ac7ed1b726a09794582e7e85c828f55808426d)입니다.

설치는 [원본 캐즘 가이드 페이지](https://chasm-js.github.io/guide/) 혹은 [캐즘 깃허브](https://github.com/chasm-js/guide)를 참고하세요.

**결정화 캐즘** 프로젝트는 [IGX](https://igx.kr/)의 하위 프로젝트입니다.

원본 캐즘의 유지보수 혹은 업데이트가 재개될 경우, 해당 프로젝트의 진행은 중단됩니다.

## FAQ

**Q. 원본 캐즘에 이어 추가적인 기능이 개발될 예정입니까?**<br>
예, 해당 프로젝트는 원본 캐즘의 LTS 역할과 새로운 프로젝트로의 분리가 예정되어 있습니다.

결정화 캐즘은 추후 캐즘과 관련되지 않은 개별 프로젝트로 재작성될 예정입니다.

**Q. 이 프로젝트는 언제까지 지속됩니까?**<br>
더 이상 해당 프로젝트의 개발이 필요하지 않거나, 원본 캐즘의 개발이 재개될 때까지 지속됩니다.

**Q. IGX의 하위 프로젝트는 무슨 의미입니까?**<br>
해당 프로젝트는 IGX 연계 프로젝트와 밀접히 연관된 주제를 가지고 있기에, 사후 지원을 IGX의 하위 프로젝트로 편입하였습니다.

IGX는 추후 크롬 웹 익스텐션을 통해 플랫폼 확장 프로젝트 개발이 예정되어 있습니다.

**Q. 작동이 되지 않습니다.**<br>
최대한 빠르게 오류를 해결하려 노력하고 있으나, 인원이 한정된 만큼 개발자가 지속적인 확인이 어렵습니다.

만일 문제가 있을 경우 [IGX 공식 지원 디스코드](https://discord.com/invite/hEb44bUFgu)에 문의를 남겨 주세요.

**Q. 버전 포맷이 원본과 상이합니다.**<br>
원본 캐즘과 혼동을 줄이기 위해 프로젝트의 독립 이후로 독자적인 버전 규칙을 사용합니다.

만일 원본 캐즘에서 한번이라도 코드가 변경되었다면, 결정화 캐즘 프로젝트의 고유한 버전이 새로 할당됩니다.

결정화 캐즘은 수정된 [유의적 버전](https://semver.org/lang/ko/)을 사용하며, 다음과 같은 버전 규칙을 사용합니다 : `CRYS-FEATURE-vMAJOR.MINOR.FIX`

**Q. 코드의 라이선스가 어떻게 됩니까?**<br/>
결정화 캐즘 프로젝트의 소스 코드는 MIT를 따릅니다.<br/>
다만, 원본 프로젝트의 소스 코드에 대한 라이선스가 지정되지 않아<br/>
원본 소스 코드에 라이선스가 적용될 경우 **원본 소스 코드에 한하여 다른 라이선스가 적용될 수 있습니다.**<br/>
결정화 캐즘의 오리지널 패치는 MIT 라이선스를 따릅니다.<br/>
오리지널 패치 여부는 유저스크립트 파일의 설명에서 확인 가능합니다.

# 설치하기

결정화 캐즘은 유저스크립트 확장입니다.

사용하려면, 먼저 [TamperMonkey](https://www.tampermonkey.net/)을 설치해야 합니다.

**반드시 원본 캐즘과 변형 캐즘을 삭제하고 사용하세요.**<br><br>

**목록에 없을 경우 결정화 캐즘 프로젝트에서 수정된 이력이 없는 스크립트입니다.**<br>
**수정되지 않은 목록에서 원본에 버그가 있을 경우 [IGX 공식 지원 디스코드](https://discord.com/invite/hEb44bUFgu)에서 버그 제보를 해주세요.**<br><br/>

# 기능 목록

**결정화 캐즘 프로젝트는 스크립트별로 기능이 분리됩니다.**<br>
**반드시 모든 스크립트를 설치할 필요는 없습니다. 필요한 기능만 골라 설치하세요.**

## 결정화 캐즘 - 카피 (v1.1.3) [ [설치](https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/copy.user.js) ]<br>

결정화 캐즘 카피는 크랙 캐릭터 제작자를 위한 보조 도구입니다.<br>
캐릭터의 원본 데이터를 JSON 형태로 추출하거나 개정된 원본 데이터를 붙여넣고,<br>
캐릭터를 복사하여 새로 게시하는 기능을 컨텍스트 메뉴에 추가합니다. <br>

## 결정화 캐즘 - 붉은 약 (v1.3.0) [ [설치](https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/redpill.user.js) ]<br>

혹시 내가 얼마나 돈을 썼는지 보고 내상을 입고 싶지 않으신가요?<br>
그게 아니라면 내가 어떤 캐릭터를 가장 애정하는지 수치로 알고 싶지 않으신가요?<br>
그런 당신을 위한, 결정화 캐즘 붉은약입니다.<br>
붉은약 기능은 지금까지 크랙에 사용한 크래커와 슈퍼챗 개수를 환산하여 계산해줍니다.<br>
세션 아래에 표기되는 캐릭터 총 소모 개수로 더욱 심한 내상을 입어보세요.<br>

> ⚠ 세션 아래 표시되는 소모량은 세션 소모량이 아닌 캐릭터 소모량입니다.<br>
> ⚠ 6월 크래커 업데이트 이전 소모된 슈퍼챗은 크래커 35개로 환산되어 계산됩니다.

## 결정화 캐즘 - 버너+ (v1.1.0) [ [설치](https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/burner.user.js) ]<br>

결정화 캐즘 버너+는 채팅방의 채팅을 외부 LLM에 의탁하여 요약하는 스크립트입니다.<br>
채팅 내용을 축약하고 요약해 전소하여 크랙 AI의 기억력을 향상시킬 수 있습니다.<br>

## 결정화 캐즘 - 과포화 (v1.0.1) [ [설치](https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/tmi.user.js) ]<br>

결정화 캐즘 과포화는 채팅의 소모 개수를 과거의 슈퍼챗 개수 표기로 변환하여 소모량 및 잔여량을 더욱 가시적으로 보여줍니다.<br>

## 결정화 캐즘 - 폴드 (v1.1.0) [ [설치](https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/fold.user.js) ]<br>

길고 긴 채팅창 세션 목록은 이제 안녕, 결정화 캐즘 폴드와 함께 더 짧은 세션 목록을 사용해보세요!<br>
결정화 캐즘 폴드는 세션 목록을 같은 캐릭터 단위로 묶어 세션 목록에 대신 출력해줍니다.<br>

## 결정화 캐즘 - 뮤트 (v1.0.0) [ [설치](https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/mute.user.js) ]<br>

결정화 캐즘 뮤트는 채팅창에서 TTS 버튼을 완전히 삭제해줍니다.<br>
TTS는 스크립트를 비활성화면 다시 사용할 수 있습니다.

> ⚠ 결정화 캐즘 뮤트는 안정성을 위해 노드를 제거하지 않고 렌더에서 제거합니다.<br>
> 이 기능으로 인해 많은 양의 반복 호출이 발생할 수 있으며, 이는 크랙 웹 사이트의 성능 저하를 불러올 수 있습니다.

## 결정화 캐즘 - 네뷸라이저 (v1.1.5) [ [설치](https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/nebulizer.user.js) ]<br>

결정화 캐즘 네뷸라이저는 차단된 제작자의 댓글 숨김 및 대량 자동 삭제를 추가해줍니다.<br>

> ⚠ 삭제 기능은 대단히 위험한 기능입니다. 결정화 캐즘의 개발자는 네뷸라이저의 대량 자동 삭제 기능을 사용함으로써 발생하는 문제에 대해 책임지지 않습니다.<br>
> 로컬 환경에서는 문제 없이 정상 작동하는 것이 확인되었습니다.
