shrimp-task-manager에서 완료된 태스크 목록을 조회한 뒤, `docs/ROADMAP.md`의 해당 태스크 항목과 하위 구현 사항에 ✅ 마크를 반영해주세요.

## 작업 절차

1. `mcp__shrimp-task-manager__list_tasks` 도구를 `status: "completed"`로 호출하여 완료된 태스크 목록을 가져옵니다.
2. `docs/ROADMAP.md` 파일을 읽습니다.
3. 완료된 각 태스크의 이름과 ROADMAP.md의 `**Task NNN: 태스크명**` 패턴을 비교하여 매칭합니다.
4. 이미 ✅가 붙어 있는 항목은 건너뜁니다.
5. ✅가 없는 완료 태스크 항목을 다음 두 단계로 수정합니다:
    - **Task 제목**: `- **Task` → `- ✅ **Task` 로 수정
    - **하위 구현 사항**: 해당 Task 바로 아래 들여쓰기된 모든 `  - [내용]` 항목을 `  - ✅ [내용]` 으로 수정 (이미 ✅가 있는 항목은 건너뜀)
6. 수정된 내용을 `docs/ROADMAP.md`에 저장합니다.
7. 변경된 항목 목록을 한국어로 요약 출력합니다. 변경 사항이 없으면 "이미 모든 완료 태스크가 반영되어 있습니다."를 출력합니다.

## 완료 표시 예시

```
- ✅ **Task 001: XXXXXXX**
  - ✅ xxxxxxxxxx
  - ✅ xxxxxxxxxx
  - ✅ xxxxxxxxxx
```
